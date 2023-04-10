export const CROWDFUND_CONTRACT_ADDRESS =
  "0x610A4D6615db21E76dBCac5FBac87A2c3E7733b2";
export const CROWDFUND_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "campaignIdLocal",
        type: "uint256",
      },
    ],
    name: "checkCampaign",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chosenCampaign",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chosenCampaign",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "contributeTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "target",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "motivationStatement",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "targetDays",
        type: "uint256",
      },
    ],
    name: "createCampaign",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "campaignIdLocal",
        type: "uint256",
      },
    ],
    name: "forceEndCampaign",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155BatchReceived",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "b4t1CoinAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "b4t1ReceiptAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "campaigns",
    outputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_motivationStatement",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_targetDays",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_targetDaysMetric",
        type: "string",
      },
      {
        internalType: "address",
        name: "_projectOwner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_target",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_collection",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_presaleEndTime",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_ended",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ethBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllCampaigns",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "_id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "_name",
            type: "string",
          },
          {
            internalType: "string",
            name: "_motivationStatement",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "_targetDays",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "_targetDaysMetric",
            type: "string",
          },
          {
            internalType: "address",
            name: "_projectOwner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "_target",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_collection",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_presaleEndTime",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "_ended",
            type: "bool",
          },
          {
            internalType: "address[]",
            name: "_contributors",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "_contributions",
            type: "uint256[]",
          },
        ],
        internalType: "struct Crowdfund.Campaign[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "campaignIdLocal",
        type: "uint256",
      },
    ],
    name: "getContribution",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chosenCampaign",
        type: "uint256",
      },
    ],
    name: "nftBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "campaignIdLocal",
        type: "uint256",
      },
    ],
    name: "targetMet",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
