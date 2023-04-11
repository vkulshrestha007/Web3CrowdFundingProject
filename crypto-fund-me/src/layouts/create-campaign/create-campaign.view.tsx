import {
  CROWDFUND_CONTRACT_ABI,
  CROWDFUND_CONTRACT_ADDRESS,
} from "@/constants/constants";
import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  OutlinedInput,
  Slider,
  Typography,
} from "@mui/material";
import { Contract, ethers, providers } from "ethers";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import Moralis from "moralis";

export default function CreateCampaignView() {
  const web3ModalRef = useRef<any>();
  useEffect(() => {
    web3ModalRef.current = new Web3Modal({
      network: "sepolia",
      providerOptions: {},
      disableInjectedProvider: false,
    });
  });
  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };
  const daysValueMap = [
    {
      value: 30,
      label: "30 days",
    },
    {
      value: 180,
      label: "180 days",
    },
    {
      value: 365,
      label: "365 days",
    },
  ];
  const [fundName, setFundName] = useState("");
  const [motivationStatement, setMotivationStatement] = useState("");
  const [fundsGoal, setFundsGoal] = useState(0);
  const [fundsTargetDays, setFundsTargetDays] = useState(30);
  const [imageFile, setImageFile] = useState(null as any);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [libraryInit, setLibraryInit] = useState(null as any);
  function resetErrorSuccess() {
    setIsError(false);
    setIsSuccess(false);
  }
  function updateFundsName(event: any) {
    resetErrorSuccess();
    setFundName(event.target.value);
  }
  function updateFundsGoal(event: any) {
    resetErrorSuccess();
    if (event.target.value < 0) {
      setFundsGoal(0);
      return;
    }
    setFundsGoal(event.target.value);
  }
  function updateMotivationStatement(event: any) {
    resetErrorSuccess();
    setMotivationStatement(event.target.value);
  }
  function updateFundsTargetDays(event: any) {
    resetErrorSuccess();
    setFundsTargetDays(event.target.value);
  }
  function updateImageFile(event: any) {
    resetErrorSuccess();
    setImageFile(event.target.files[0]);
  }

  async function handleSubmit(e: any) {
    // Prevent the browser from reloading the page
    e.preventDefault();
    console.log(imageFile);
    try {
      getBase64(imageFile, async (imageBase64: string) => {
        const signer = await getProviderOrSigner(true);
        const tokenContract = new Contract(
          CROWDFUND_CONTRACT_ADDRESS,
          CROWDFUND_CONTRACT_ABI,
          signer
        );
        const endTime = new Date();
        // endTime.setDate(endTime.getDate() + fundsTargetDays);
        endTime.setMinutes(endTime.getMinutes() + fundsTargetDays);
        const imageRes = await uploadImage(imageBase64);
        const res = await tokenContract.createCampaign(
          ethers.utils.parseUnits(fundsGoal.toString(), "ether"),
          fundName,
          motivationStatement,
          imageRes,
          endTime.getTime()
        );
        console.log(res);
        setIsSuccess(true);
      });
    } catch (err) {
      console.log(err);
      setIsError(true);
    }
  }

  function getBase64(file: any, cb: Function) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      cb(reader.result);
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  }

  async function uploadImage(imageBase64: string) {
    if (libraryInit === null) {
      setLibraryInit(
        await Moralis.start({
          apiKey: process.env.MORALIS_KEY,
          // ...and any other configuration
        })
      );
    }

    const abi = [
      {
        path: imageFile.name,
        content: imageBase64,
      },
    ];

    const response = await Moralis.EvmApi.ipfs.uploadFolder({ abi });

    console.log(response.toJSON());
    const res: any = response.toJSON();
    return res[0].path;
  }

  function valuetext(value: number) {
    return `${value} days`;
  }

  return (
    <>
      <Box
        component="form"
        className="p-10"
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
        }}
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="outlined-adornment-amount" required>
            Fund Name
          </InputLabel>
          <OutlinedInput
            id="fund_name"
            label="Fund Name"
            required
            onChange={updateFundsName}
          />
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="outlined-adornment-amount" required>
            Motivation Statement
          </InputLabel>
          <OutlinedInput
            id="motivation-statement"
            label="Motivation Statement"
            required
            onChange={updateMotivationStatement}
          />
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="outlined-adornment-amount" required>
            Funds Goal
          </InputLabel>
          <OutlinedInput
            id="funds-goal"
            label="Funds Goal"
            type="number"
            value={fundsGoal}
            required
            onChange={updateFundsGoal}
          />
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <Typography gutterBottom>Funds Target Days</Typography>
          <Slider
            className="mt-9 mb-7"
            aria-label="Always visible"
            defaultValue={30}
            getAriaValueText={valuetext}
            step={1}
            marks={daysValueMap}
            min={1}
            max={365}
            valueLabelDisplay="on"
            onChange={updateFundsTargetDays}
          />
        </FormControl>

        <FormControl fullWidth sx={{ m: 1 }}>
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="label"
          >
            <input
              accept="image/*"
              type="file"
              onChange={updateImageFile}
              required
            />
          </IconButton>
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <Button variant="outlined" type="submit">
            Submit
          </Button>
        </FormControl>
      </Box>
      {isError && (
        <Alert severity="error">
          Something went wrong. Please try again later!
        </Alert>
      )}
      {isSuccess && (
        <Alert severity="success">Campaign created successfully!</Alert>
      )}
    </>
  );
}
