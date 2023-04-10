// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";
import "./Batch4Team1Coin.sol";
import "./Batch4Team1Receipt.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract Crowdfund is ERC1155Holder {
    Batch4Team1Coin b4t1Coin;
    Batch4Team1Receipt b4t1Receipt;

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

    mapping(uint => mapping(address => uint)) public _contributionDetails;

    Campaign[] public campaigns;

    constructor(address b4t1CoinAddress, address b4t1ReceiptAddress) {
        b4t1Coin = Batch4Team1Coin(b4t1CoinAddress);
        b4t1Receipt = Batch4Team1Receipt(b4t1ReceiptAddress);
    }

    modifier campaignOwner(uint campaignIdLocal, address sender) {
        require(
            campaigns[campaignIdLocal]._projectOwner == sender,
            "Only campaignOwner can trigger this functionality."
        );

        _;
    }

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

    function checkCampaign(
        uint campaignIdLocal
    ) external returns (string memory) {
        console.log(
            "Is campaign active :: %s",
            campaigns[campaignIdLocal]._ended != true
        );

        if (campaigns[campaignIdLocal]._ended == true) {
            console.log("Returning campaign ended.");
            return "ended";
        }

        // Time ended + Met contribution ?
        console.log(
            "Time met ?? :: %s",
            campaigns[campaignIdLocal]._presaleEndTime < block.timestamp
        );
        console.log(
            "Contribution goal met ?? :: %s",
            campaigns[campaignIdLocal]._collection >=
                campaigns[campaignIdLocal]._target
        );

        if (
            campaigns[campaignIdLocal]._presaleEndTime < block.timestamp &&
            campaigns[campaignIdLocal]._collection <
            campaigns[campaignIdLocal]._target
        ) {
            console.log("Calling endCampaign");

            endCampaign(campaignIdLocal);
            return "ended";
        }

        return "active";
    }

    function endCampaign(uint campaignIdLocal) internal {
        require(gasleft() > MINIMUM_AMOUNT, "Insufficient gas balance");
        require(
            campaigns[campaignIdLocal]._ended == false,
            "Campaign already ended."
        );

        console.log("Marking campaign ended with id = %s", campaignIdLocal);
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
                console.log(
                    "No contribution to return to address :: %s",
                    campaigns[campaignIdLocal]._contributors[i]
                );
                continue;
            }

            // Return the tokens back to the contributor.
            b4t1Coin.transfer(
                campaigns[campaignIdLocal]._contributors[i],
                _contributionDetails[campaignIdLocal][
                    campaigns[campaignIdLocal]._contributors[i]
                ]
            );

            console.log(
                "Amount %s returned to address %s",
                _contributionDetails[campaignIdLocal][
                    campaigns[campaignIdLocal]._contributors[i]
                ],
                campaigns[campaignIdLocal]._contributors[i]
            );
        }

        console.log("Campaign id %s ended", campaignIdLocal);
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

    receive() external payable {}

    fallback() external payable {}
}
