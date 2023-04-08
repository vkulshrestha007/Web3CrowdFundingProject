// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";
import "./Batch4Team1Coin.sol";
import "./Batch4Team1Receipt.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract Crowdfund is ERC1155Holder {

    Batch4Team1Coin b4t1Coin;
    Batch4Team1Receipt b4t1Receipt;

    uint campaignId = 0;

    struct Campaign {

        uint _id;
        string _name;
        address _projectOwner;

        uint _target;
        uint _collection;
        uint256 _presaleEndTime; // timeline ?

        bool _ended;
        // address payable[] _contributors; // To be used for ETH contributions
        address[] _contributors;
        uint256[] _contributions;
    }

    Campaign[] public campaigns;

    constructor (address b4t1CoinAddress, address b4t1ReceiptAddress) {
        b4t1Coin = Batch4Team1Coin(b4t1CoinAddress);
        b4t1Receipt = Batch4Team1Receipt(b4t1ReceiptAddress);
    }

    // Constructor for ETH contributions
    // constructor() {}

    modifier campaignOwner(uint campaignIdLocal, address sender) {
      if (campaigns[campaignIdLocal]._projectOwner == sender) {
         _;
      }
    }

    // function createCampaign(uint target, string memory name, uint endTime) external returns (uint){
    function createCampaign(uint target, string memory name) external returns (uint){

        Campaign memory _c;
        _c._id = campaignId++;
        _c._name = name;
        _c._projectOwner = msg.sender;
        _c._target = target;
        // _c._presaleEndTime = endTime;
        _c._presaleEndTime = block.timestamp + 2 minutes;  // TODO remove this line + uncomment above line
        _c._ended = false;

        campaigns.push(_c);

        return campaignId - 1;
    }

    function checkCampaign(uint campaignIdLocal) external returns (string memory){

        console.log("Is campaign active :: %s",  campaigns[campaignIdLocal]._ended != true);

        if (campaigns[campaignIdLocal]._ended == true) {
            console.log("Returning campaign ended.");
            return "ended";
        }

        // Time ended + Met contribution ?
        console.log("Time met ?? :: %s", campaigns[campaignIdLocal]._presaleEndTime < block.timestamp);
        console.log("Contribution goal met ?? :: %s", campaigns[campaignIdLocal]._collection >= campaigns[campaignIdLocal]._target);

        if (campaigns[campaignIdLocal]._presaleEndTime < block.timestamp && 
            campaigns[campaignIdLocal]._collection >= campaigns[campaignIdLocal]._target) {
            
            console.log("Calling encCampaign");

            endCampaign(campaignIdLocal);
            return "ended";
        }

        return "active";
    }

    function endCampaign(uint campaignIdLocal) internal {

        console.log("Marking campaign ended with id = %s", campaignIdLocal);
        campaigns[campaignIdLocal]._ended = true;

        // For this campaign, loop over the contributors array
        for (uint8 i = 0; i < campaigns[campaignIdLocal]._contributors.length; i++) {

            if (campaigns[campaignIdLocal]._contributions[i] == 0) {

                console.log("No contribution to return to address :: %s", campaigns[campaignIdLocal]._contributors[i]);
                continue;
            }

            // Return the tokens back to the contributor.
            // TODO - stake tokens for Gas fee
            b4t1Coin.transfer(campaigns[campaignIdLocal]._contributors[i], campaigns[campaignIdLocal]._contributions[i]);
            
            // To be used for ETH contributions return
            // campaigns[campaignIdLocal]._contributors[i].transfer(campaigns[campaignIdLocal]._contributions[i]);

            console.log("Amount returned :: %s", campaigns[campaignIdLocal]._contributions[i]);
            console.log("Returned to address :: %s", campaigns[campaignIdLocal]._contributors[i]);
        }

        console.log("Campaign id %s ended", campaignIdLocal);

    }

    function forceEndCampaign(uint campaignIdLocal) external campaignOwner(campaignIdLocal, msg.sender) {

        endCampaign(campaignIdLocal);
    }

    function targetMet(uint campaignIdLocal) external view returns(bool){

        return campaigns[campaignIdLocal]._collection >= campaigns[campaignIdLocal]._target;
    }

    function getContribution(uint campaignIdLocal) external view returns(uint){

        return campaigns[campaignIdLocal]._collection;
    }

    // TODO remove method
    // function contributeETH(uint chosenCampaign) external payable {

    //     require(msg.value > 0, "Must input tokens to deposit");
    //     require(campaigns[chosenCampaign]._ended == false, "Campaign must be active");

    //     campaigns[chosenCampaign]._contributors.push(payable(msg.sender));
    //     campaigns[chosenCampaign]._contributions.push(msg.value);
    //     campaigns[chosenCampaign]._collection += msg.value;
    // }

    function contributeTokens(uint chosenCampaign, uint amount) external {

        require(amount > 0, "Must input tokens to deposit");
        require(amount <= campaigns[chosenCampaign]._target, "Contribution amount is more than the target");
        require(campaigns[chosenCampaign]._ended == false, "Campaign must be active");
        require(campaigns[chosenCampaign]._collection < campaigns[chosenCampaign]._target, "Target reached. No more contributions are accepted.");
        require(b4t1Coin.allowance(msg.sender, address(this)) >= amount, "Plz approve token transfer to contract");

        // Receive tokens
        b4t1Coin.transferFrom(msg.sender, address(this), amount);

        // campaigns[chosenCampaign]._contributors.push(payable(msg.sender));
        campaigns[chosenCampaign]._contributors.push(msg.sender);
        campaigns[chosenCampaign]._contributions.push(amount);
        campaigns[chosenCampaign]._collection += amount;

        // Return receipt
        b4t1Receipt.mint(msg.sender, chosenCampaign, amount, "");
    }

    function claimReward(uint chosenCampaign, uint amount) external {

        require(amount > 0, "Not a valid amount for withdrawal");

        for (uint8 i = 0; i < campaigns[chosenCampaign]._contributors.length; i++) {

            if (campaigns[chosenCampaign]._contributors[i] != msg.sender) {
                continue;
            }

            require(amount <= campaigns[chosenCampaign]._contributions[i], "Requested amount is more than deposited amount");

            // b4t1Receipt.safeTransferFrom(deployerAddress, playerAddress, 2, 1, "0x0"); // TODO 
            // b4t1Coin.transferFrom(address(this), msg.sender, amount);
            campaigns[chosenCampaign]._contributions[i] -= amount;
            break;
        }

    }

    function ethBalance() external view returns (uint){

        return address(this).balance;
    }

    function tokenBalance() external view returns (uint){

        return b4t1Coin.balanceOf(address(this));
    }

    function nftBalance(uint chosenCampaign) external view returns (uint){

        return b4t1Receipt.balanceOf(msg.sender, chosenCampaign);
    }

    receive() external payable {}

    fallback() external payable {}

}