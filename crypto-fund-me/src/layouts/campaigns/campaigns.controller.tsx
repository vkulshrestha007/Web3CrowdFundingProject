import { Contract, ethers, providers } from "ethers";
import CampaignsView from "./campaigns.view";
import Web3Modal from "web3modal";
import { useEffect, useRef, useState } from "react";
import {
  CROWDFUND_CONTRACT_ABI,
  CROWDFUND_CONTRACT_ADDRESS,
} from "@/constants/constants";

export default function CampaignsController() {
  const web3ModalRef = useRef<any>();
  useEffect(() => {
    web3ModalRef.current = new Web3Modal({
      network: "sepolia",
      providerOptions: {},
      disableInjectedProvider: false,
    });
    if (!campaignCalled) fetchAllCampaigns();
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

  const [allCampaigns, setAllCampaigns] = useState([]);
  const [campaignCalled, setCampaignCalled] = useState(false);

  async function fetchAllCampaigns() {
    try {
      setCampaignCalled(true);
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        CROWDFUND_CONTRACT_ADDRESS,
        CROWDFUND_CONTRACT_ABI,
        provider
      );
      const res = await tokenContract.getAllCampaigns();
      console.log(res);
      setAllCampaigns(res);
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <>
      <CampaignsView campaigns={allCampaigns}></CampaignsView>
    </>
  );
}
