import Loader from "@/shared/components/loader";
import NavbarController from "@/shared/components/navbar/navbar.controller";
import useUtilityStore from "@/stores/utility.store";
import useWalletStore from "@/stores/wallet.store";
import "@/styles/globals.css";
import { createTheme, ThemeProvider } from "@mui/material";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false);
  const utilityLoading = useUtilityStore((state: any) => state.loading);
  const router = useRouter();
  const walletConnected = useWalletStore((state: any) => state.walletConnected);

  useEffect(() => {
    if (!walletConnected) {
      router.push("/");
    }
  }, [walletConnected]);

  const handleStart = () => setLoading(true);
  const handleComplete = () => setLoading(false);

  useEffect(() => {
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router.events]);

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <Loader isLoading={loading || utilityLoading} overlay={true}></Loader>
        <NavbarController></NavbarController>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
