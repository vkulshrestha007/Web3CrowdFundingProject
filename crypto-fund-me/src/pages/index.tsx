import Head from "next/head";
import { Inter } from "next/font/google";
import HomeController from "@/layouts/home/home.controller";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>CryptoFundMe</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeController></HomeController>
    </>
  );
}
