import {
  BATCH_4_TEAM_1_COIN_ABI,
  BATCH_4_TEAM_1_COIN_ADDRESS,
  BATCH_4_TEAM_1_RECEIPT_ABI,
  BATCH_4_TEAM_1_RECEIPT_ADDRESS,
  CROWDFUND_CONTRACT_ABI,
  CROWDFUND_CONTRACT_ADDRESS,
} from "@/constants/constants";
import CardController from "@/shared/components/card/card.controller";
import { TimerController } from "@/shared/components/timer/timer.controller";
import useUtilityStore from "@/stores/utility.store";
import {
  Alert,
  AlertColor,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  TextField,
} from "@mui/material";
import { Contract, ethers, providers } from "ethers";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";

export default function CampaignsView({ campaigns }: { campaigns: any[] }) {
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
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [contributionBuffer, setContributionBuffer] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("" as any);
  const [claimRewardOpen, setClaimRewardOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("" as any);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState(
    "error" as AlertColor
  );
  const [rewardsPending, setRewardsPending] = useState("");

  const setUtilityLoading = useUtilityStore((state: any) => state.setLoading);
  const timerVal = 10000;
  function getCardData(campaign: any) {
    const target = Number(ethers.utils.formatEther(campaign._target));
    const collection = Number(ethers.utils.formatEther(campaign._collection));
    const progress =
      collection === 0 ? 0 : Math.floor((collection / target) * 100);
    const currentEpoc = new Date().getTime();
    const showClaim =
      progress === 100 &&
      parseInt(campaign._presaleEndTime._hex) <= currentEpoc;
    const showEndCampaign =
      !showClaim && parseInt(campaign._presaleEndTime._hex) <= currentEpoc;
    const expiryDate = new Date(
      parseInt(campaign._presaleEndTime._hex)
    ).toLocaleString();
    const showContribute =
      new Date(parseInt(campaign._presaleEndTime._hex)).getTime() >
      new Date().getTime();
    return {
      image: campaign._imagePath || "./crowdfunding.svg",
      name: campaign._name,
      statement: campaign._motivationStatement,
      ended: campaign._ended,
      target,
      collection,
      progress,
      expiryDate,
      showClaim,
      showEndCampaign,
      showContribute,
      id: parseInt(campaign._id._hex),
    };
  }

  async function fetchReward(campaign: any) {
    const signer = (await getProviderOrSigner(true)) as any;
    const tokenContract = new Contract(
      CROWDFUND_CONTRACT_ADDRESS,
      CROWDFUND_CONTRACT_ABI,
      signer
    );
    const address = await signer?.getAddress();
    const res = await tokenContract._contributionDetails(
      parseInt(campaign._id._hex),
      address
    );
    const reward = ethers.utils.formatEther(res);
    return reward;
  }

  function handleClose() {
    setContributionAmount("");
    setOpen(false);
  }
  function handleCancelContribution() {
    setContributionAmount("");
    setContributionBuffer(false);
  }

  function updateContributionAmount(event: any) {
    if (event.target.value < 0) {
      setContributionAmount("");
      return;
    }
    setContributionAmount(event.target.value);
  }

  function handleContributionTimer() {
    if (contributionAmount === "") {
      openSnackbar("Enter some amount to contribute", "warning");
      return;
    }
    setContributionBuffer(true);
  }

  async function initiateContribution() {
    // b4t1Coin address.approve(Crowdfund contract address, amount);
    // crowdFundContract.approve(amount to contribute)
    if (!contributionBuffer) {
      return;
    }
    setContributionBuffer(false);

    try {
      setUtilityLoading(true);
      const signer = await getProviderOrSigner(true);
      const batch4Coin = new Contract(
        BATCH_4_TEAM_1_COIN_ADDRESS,
        BATCH_4_TEAM_1_COIN_ABI,
        signer
      );
      console.log(
        ethers.utils.parseUnits(contributionAmount.toString(), "ether")
      );
      const tx = await batch4Coin.approve(
        CROWDFUND_CONTRACT_ADDRESS,
        ethers.utils.parseUnits(contributionAmount.toString(), "ether")
      );
      const txResult = await tx.wait();
      if (txResult.status !== 1) {
        openSnackbar("Approval failed");
      }

      const tokenContract = new Contract(
        CROWDFUND_CONTRACT_ADDRESS,
        CROWDFUND_CONTRACT_ABI,
        signer
      );

      console.log(
        ethers.utils.parseUnits(contributionAmount.toString(), "ether")
      );
      const res = await tokenContract.contributeTokens(
        parseInt(campaigns[selectedIndex]._id._hex),
        ethers.utils.parseUnits(contributionAmount.toString(), "ether")
      );
      console.log(res);
      setUtilityLoading(false);
      openSnackbar("Contribution Successful", "success");
    } catch (err) {
      console.log(err);
      setUtilityLoading(false);
      openSnackbar("Something went wrong. Please try again later", "error");
    }
    setOpen(false);
  }

  function contribute(index: number) {
    setSelectedIndex(index);
    setOpen(true);
  }

  async function openClaimRewards(index: number) {
    setSelectedIndex(index);
    try {
      setUtilityLoading(true);
      const res = await fetchReward(campaigns[index]);
      setRewardsPending(res);
      setUtilityLoading(false);
      setClaimRewardOpen(true);
    } catch (err) {
      console.log(err);
      setUtilityLoading(false);
      openSnackbar("Something went wrong. Please try again later", "error");
    }
  }

  function handleClaimRewardsClose() {
    setWithdrawAmount("");
    setClaimRewardOpen(false);
  }

  function openSnackbar(message: string, severity = "error") {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity as AlertColor);
    setSnackbarOpen(true);
  }

  function handleSnackbarClose() {
    setSnackbarOpen(false);
  }

  async function endCampaign() {
    try {
      setUtilityLoading(true);
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        CROWDFUND_CONTRACT_ADDRESS,
        CROWDFUND_CONTRACT_ABI,
        signer
      );
      const res = await tokenContract.checkCampaign(
        parseInt(campaigns[selectedIndex]._id._hex)
      );
      const tx = await res.wait();
      console.log(tx);
      setUtilityLoading(false);
      openSnackbar("Campaign ended successfully", "success");
    } catch (err) {
      console.log(err);
      setUtilityLoading(false);
      openSnackbar("Something went wrong. Please try again later", "error");
    }
  }

  async function claimRewards() {
    if (withdrawAmount === "") {
      openSnackbar("Enter some amount to withdraw", "warning");
    }
    try {
      setUtilityLoading(true);
      const signer = await getProviderOrSigner(true);
      const batch4Receipt = new Contract(
        BATCH_4_TEAM_1_RECEIPT_ADDRESS,
        BATCH_4_TEAM_1_RECEIPT_ABI,
        signer
      );
      const tx = await batch4Receipt.setApprovalForAll(
        CROWDFUND_CONTRACT_ADDRESS,
        true
      );

      const txResult = await tx.wait();
      if (txResult.status !== 1) {
        openSnackbar("Approval failed");
      }

      const tokenContract = new Contract(
        CROWDFUND_CONTRACT_ADDRESS,
        CROWDFUND_CONTRACT_ABI,
        signer
      );
      const res = await tokenContract.claimReward(
        parseInt(campaigns[selectedIndex]._id._hex),
        ethers.utils.parseUnits(withdrawAmount.toString(), "ether")
      );
      console.log(res);
      setUtilityLoading(false);
      setRewardsPending("");
      setWithdrawAmount("");
      setClaimRewardOpen(false);
      openSnackbar("Rewards claimed successfully", "success");
    } catch (err) {
      console.log(err);
      setUtilityLoading(false);
      openSnackbar("Something went wrong. Please try again later", "error");
    }
  }

  function updateWithdrawAmount(event: any) {
    if (event.target.value < 0) {
      setWithdrawAmount("");
      return;
    }
    setWithdrawAmount(event.target.value);
  }

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <div className="flex flex-wrap p-10 justify-start">
        {campaigns.map((campaign: any, index) => (
          <div className="m-4" key={index}>
            <CardController
              card={getCardData(campaign)}
              contribute={contribute}
              claimRewards={openClaimRewards}
              endCampaign={endCampaign}
              index={index}
            ></CardController>
          </div>
        ))}
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{campaigns[selectedIndex]?._name}</DialogTitle>
        <DialogContent>
          <DialogContentText className="font-semibold mb-4">
            {campaigns[selectedIndex]?._motivationStatement}
          </DialogContentText>
          <DialogContentText>
            To contribute to this campaign please enter the token.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="funds-contribution"
            label="Funds Contribution"
            type="number"
            fullWidth
            variant="standard"
            value={contributionAmount}
            onChange={updateContributionAmount}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          {contributionBuffer ? (
            <Button onClick={handleCancelContribution}>
              Click here to cancel your contribution within{" "}
              <TimerController
                timerVal={timerVal / 1000}
                callback={initiateContribution}
              ></TimerController>{" "}
              seconds
            </Button>
          ) : (
            <>
              <Button onClick={handleContributionTimer}>Contribute</Button>
              <Button onClick={handleClose}>Cancel</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={claimRewardOpen} onClose={handleClaimRewardsClose}>
        <DialogTitle>{campaigns[selectedIndex]?._name}</DialogTitle>
        <DialogContent>
          <DialogContentText className="font-semibold mb-4">
            {campaigns[selectedIndex]?._motivationStatement}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="funds-withdraw"
            label="Funds to be withdrawn"
            type="number"
            fullWidth
            variant="standard"
            value={withdrawAmount}
            onChange={updateWithdrawAmount}
            inputProps={{ min: 0 }}
          />
          <DialogContentText>
            Claims Pending:{" " + rewardsPending}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={claimRewards}>Withdraw</Button>
          <Button onClick={handleClaimRewardsClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
