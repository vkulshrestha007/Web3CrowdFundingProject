import NavbarController from "@/shared/components/navbar/navbar.controller";
import useWalletStore from "@/stores/wallet.store";
import "@/styles/globals.css";
import { createTheme, ThemeProvider } from "@mui/material";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const walletConnected = useWalletStore((state: any) => state.walletConnected);
  useEffect(() => {
    if (!walletConnected) {
      router.push("/");
    }
  }, [walletConnected]);
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <NavbarController></NavbarController>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
