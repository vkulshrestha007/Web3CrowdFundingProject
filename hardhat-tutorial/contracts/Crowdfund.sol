// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./Batch4Team1Coin.sol";
import "./Batch4Team1Receipt.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

// @title A crowdfunding contract
// @author Deep Kulshreshtha
// @notice Developed as part of web3 training. Batch 4 Team 1
// @notice You can use this contract for basic simulation
// @dev All function calls are currently implemented without side effects
// @custom:experimental This is an experimental contract.
contract Crowdfund is ERC1155Holder {
    Batch4Team1Coin b4t1Coin;
    Batch4Team1Receipt b4t1Receipt;

    // @notice Minimum amount of ETH required to allow the contract to function.
    uint constant MINIMUM_AMOUNT = 10_000;

    uint campaignId = 0;

    struct Campaign {
        uint _id;
        string _name;
        string _motivationStatement;
        string _imagePath;
        address _projectOwner;
        uint _target;
        uint _collection;
        uint256 _withdrawPledgeTime;
        uint256 _presaleEndTime;
        bool _ended;
        address[] _contributors;
    }

    // @notice Nested mapping to maintain all contributions to the campaigns.
    // @dev Campaign index mapped to the list of contributor's addresses.
    // @dev Each contributor address mapped to the contribution
    mapping(uint => mapping(address => uint)) public _contributionDetails;

    Campaign[] public campaigns;

    constructor(address b4t1CoinAddress, address b4t1ReceiptAddress) {
        b4t1Coin = Batch4Team1Coin(b4t1CoinAddress);
        b4t1Receipt = Batch4Team1Receipt(b4t1ReceiptAddress);
    }

    // @notice Modifier to limit functionalities for the campaign owner
    modifier campaignOwner(uint campaignIdLocal, address sender) {
        require(
            campaigns[campaignIdLocal]._projectOwner == sender,
            "Only campaignOwner can trigger this functionality."
        );

        _;
    }

    // @notice Create the crowdfund campaign based on the inputs
    // @param target The number of ERC20 tokens to reach for the crowdfund
    // @param name Name of the campaign
    // @param motivationStatement Statement for the campaign
    // @param imagePath IPFS path of the campaign's image
    // @param endTime The epoch when this campaign contribution is planned to be ended
    // @return projectId as the Id of the newly created campaign
    function createCampaign(
        uint target,
        string memory name,
        string memory motivationStatement,
        string memory imagePath,
        uint endTime
    ) external returns (uint) {
        Campaign memory _c;
        _c._id = campaignId++;
        _c._name = name;
        _c._motivationStatement = motivationStatement;
        _c._imagePath = imagePath;
        _c._projectOwner = msg.sender;
        _c._target = target;
        _c._presaleEndTime = endTime;
        _c._withdrawPledgeTime = block.timestamp + 2 minutes;
        _c._ended = false;

        campaigns.push(_c);

        return campaignId - 1;
    }

    // @notice Get the current status of the campaign
    // @dev Depends on whether the campaign collection goal has been met.
    // @dev And whether collection timeline has ended
    // @param campaignId The index of the campaign. Returned by createCampaign method
    // @return status of the campaign as active/ inactive
    function checkCampaign(
        uint campaignIdLocal
    ) external returns (string memory) {
        if (campaigns[campaignIdLocal]._ended == true) {
            return "ended";
        }

        // Time ended + Met contribution ?
        if (
            campaigns[campaignIdLocal]._presaleEndTime < block.timestamp &&
            campaigns[campaignIdLocal]._collection <
            campaigns[campaignIdLocal]._target
        ) {
            endCampaign(campaignIdLocal);
            return "ended";
        }

        return "active";
    }

    // @notice End the campaign. And return the contributions back.
    // @notice This would be done when the campaign is unsuccessful
    // @dev Since campaign was unsuccessful, we do not get the Receipts ( ERC1155 ) back.
    // @dev It would add not value, and would just cost extra gas fee.
    // @param campaignId The index of the campaign. Returned by createCampaign method
    function endCampaign(uint campaignIdLocal) internal {
        require(gasleft() > MINIMUM_AMOUNT, "Insufficient gas balance");
        require(
            campaigns[campaignIdLocal]._ended == false,
            "Campaign already ended."
        );

        campaigns[campaignIdLocal]._ended = true;

        // For this campaign, loop over the contributors
        for (
            uint8 i = 0;
            i < campaigns[campaignIdLocal]._contributors.length;
            i++
        ) {
            if (
                _contributionDetails[campaignIdLocal][
                    campaigns[campaignIdLocal]._contributors[i]
                ] == 0
            ) {
                continue;
            }

            // Return the tokens back to the contributor.
            b4t1Coin.transfer(
                campaigns[campaignIdLocal]._contributors[i],
                _contributionDetails[campaignIdLocal][
                    campaigns[campaignIdLocal]._contributors[i]
                ]
            );
        }
    }

    function forceEndCampaign(
        uint campaignIdLocal
    ) external campaignOwner(campaignIdLocal, msg.sender) {
        endCampaign(campaignIdLocal);
    }

    function targetMet(uint campaignIdLocal) external view returns (bool) {
        return
            campaigns[campaignIdLocal]._collection >=
            campaigns[campaignIdLocal]._target;
    }

    function getContribution(
        uint campaignIdLocal
    ) external view returns (uint) {
        return campaigns[campaignIdLocal]._collection;
    }

    // @notice Method to contribute to a campaign
    // @dev Upon contribution, a receipt ( ERC1155 ) are issued back to the contributor
    // @param campaignId The index of the campaign. Returned by createCampaign method
    // @param amount of tokens the contributor invests in the campaign
    function contributeTokens(uint chosenCampaign, uint amount) external {
        require(amount > 0, "Must input tokens to deposit");
        require(msg.sender != address(0), "Invalid wallet address");

        require(
            campaigns[chosenCampaign]._collection <
                campaigns[chosenCampaign]._target,
            "Target reached. No more contributions are accepted."
        );
        require(
            campaigns[chosenCampaign]._collection + amount <=
                campaigns[chosenCampaign]._target,
            "Target amount exceeded. Reduce amount to contribute."
        );
        require(
            block.timestamp < campaigns[chosenCampaign]._presaleEndTime,
            "Contributions allowed only before deadline"
        );
        require(
            campaigns[chosenCampaign]._ended == false,
            "Campaign must be active"
        );

        require(
            b4t1Coin.allowance(msg.sender, address(this)) >= amount,
            "Approve token transfer to contract"
        );
        require(gasleft() > MINIMUM_AMOUNT, "Insufficient gas balance");

        // Receive tokens
        b4t1Coin.transferFrom(msg.sender, address(this), amount);

        // Collect details of contributor/ contribution
        campaigns[chosenCampaign]._contributors.push(msg.sender);
        _contributionDetails[chosenCampaign][msg.sender] += amount;
        campaigns[chosenCampaign]._collection += amount;

        // Return receipt
        b4t1Receipt.mint(msg.sender, chosenCampaign, amount, "");
    }

    // @notice User decides to withdraw the contribution
    // @dev User needs to return the receipt.
    // @dev To do so, user needs to approve the ERC1155 transfer by this contract before this method is called.
    // @param campaignId The index of the campaign. Returned by createCampaign method
    function withdrawPledge(uint chosenCampaign) external {
        require(
            block.timestamp < campaigns[chosenCampaign]._withdrawPledgeTime,
            "Pledged tokens cannot be withdrawn after 2 mins"
        );

        b4t1Receipt.safeTransferFrom(
            msg.sender,
            address(this),
            chosenCampaign,
            _contributionDetails[chosenCampaign][msg.sender],
            "x0"
        );
        b4t1Coin.transfer(
            msg.sender,
            _contributionDetails[chosenCampaign][msg.sender]
        );

        _contributionDetails[chosenCampaign][msg.sender] = 0;
        campaigns[chosenCampaign]._collection -= _contributionDetails[
            chosenCampaign
        ][msg.sender];
    }

    // @notice User claims reward of his contribution
    // @dev Campaign is complete. No need to take back the receipt.
    // @dev It would add not value, and would just cost extra gas fee.
    // @param campaignId The index of the campaign. Returned by createCampaign method
    // @param amount from his contribution that the user wants to claim back. Use can claim partial rewards
    function claimReward(uint chosenCampaign, uint amount) external {
        require(amount > 0, "Not a valid amount for withdrawal");
        require(msg.sender != address(0), "Invalid wallet address");

        require(
            block.timestamp > campaigns[chosenCampaign]._presaleEndTime,
            "Reward can be claimed after campaign has completed"
        );
        require(
            _contributionDetails[chosenCampaign][msg.sender] >= amount,
            "Amount claimed is more than amount deposited"
        );
        require(gasleft() > MINIMUM_AMOUNT, "Insufficient gas balance");

        b4t1Receipt.safeTransferFrom(
            msg.sender,
            address(this),
            chosenCampaign,
            amount,
            "x0"
        );
        b4t1Coin.transfer(msg.sender, amount);

        _contributionDetails[chosenCampaign][msg.sender] -= amount;
    }

    function ethBalance() external view returns (uint) {
        return address(this).balance;
    }

    function tokenBalance() external view returns (uint) {
        return b4t1Coin.balanceOf(address(this));
    }

    function nftBalance(uint chosenCampaign) external view returns (uint) {
        return b4t1Receipt.balanceOf(msg.sender, chosenCampaign);
    }

    function getAllCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }

    receive() external payable {}

    fallback() external payable {}
}
