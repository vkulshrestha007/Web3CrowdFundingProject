import CardController from "@/shared/components/card/card.controller";
import { TimerController } from "@/shared/components/timer/timer.controller";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { ethers, providers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { setInterval, clearInterval } from "timers";
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
  function getCardData(campaign: any) {
    const target = Number(ethers.utils.formatEther(campaign._target));
    const collection = Number(ethers.utils.formatEther(campaign._collection));
    return {
      image: campaign._img || "./crowdfunding.svg",
      name: campaign._name,
      statement: campaign._motivationStatement,
      progress: collection === 0 ? 0 : Math.floor((target / collection) * 100),
    };
  }

  function handleClose() {
    setOpen(false);
  }
  const [intervalId, setIntervalId] = useState(null as any);
  function handleContribute() {
    setContributionBuffer(true);
    setIntervalId(
      setInterval(() => {
        setContributionBuffer(false);
        clearInterval(intervalId);
        initiateContribution();
      }, 60000)
    );
  }
  function handleCancelContribution() {
    clearInterval(intervalId);
    setContributionBuffer(false);
  }
  function initiateContribution() {}
  function contribute(index: number) {
    setSelectedIndex(index);
    setOpen(true);
  }
  function claimRewards(index: number) {
    setSelectedIndex(index);
  }
  return (
    <>
      <div className="flex flex-wrap p-10 justify-between">
        {campaigns.map((campaign: any, index) => (
          <div className="m-4">
            <CardController
              card={getCardData(campaign)}
              contribute={contribute}
              claimRewards={claimRewards}
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
          />
        </DialogContent>
        <DialogActions>
          {contributionBuffer ? (
            <Button onClick={handleCancelContribution}>
              Click here to cancel your contribution within{" "}
              <TimerController timerVal={60}></TimerController> seconds
            </Button>
          ) : (
            <>
              <Button onClick={handleContribute}>Contribute</Button>
              <Button onClick={handleClose}>Cancel</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
