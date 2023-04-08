import { create } from "zustand";

const useWalletStore = create((set) => ({
  walletConnected: false,
  provider: undefined,
  setWalletConnected: (walletConnected: boolean) => {
    set({ walletConnected });
  },
  setProvider: (provider: any) => {
    set({ provider });
  },
}));

export default useWalletStore;
