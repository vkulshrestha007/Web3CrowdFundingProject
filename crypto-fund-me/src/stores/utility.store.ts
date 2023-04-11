import { create } from "zustand";

const useUtilityStore = create((set) => ({
  loading: false,
  setLoading: (loading: boolean) => {
    set({ loading });
  },
}));

export default useUtilityStore;
