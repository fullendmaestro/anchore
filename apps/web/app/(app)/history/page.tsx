"use client";
import { useState } from "react";
import { Contract, HttpHandler, RpcClient } from "casper-js-sdk";
import { BridgingCard } from "./_components/bridging-card";
import Wallet from "./_components/wallet";

export default function BridgingPage() {
  // const [publicKey, setPublicKey] = useState(null);
  // const CasperWalletProvider = window?.CasperWalletProvider;

  // if (CasperWalletProvider == null) {
  //   return <h1>Casper Wallet not Installed</h1>;
  // }

  // const provider = CasperWalletProvider();

  // const rpcHandler = new HttpHandler("http://<Node Address>:7777/rpc");
  // const rpcCient = new RpcClient(rpcHandler);

  return (
    <main
      className="container mx-auto p-4 overflow-y-auto"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      {/* <Wallet
        publicKey={publicKey}
        setPublicKey={setPublicKey}
        provider={provider}
      /> */}
      <BridgingCard />
    </main>
  );
}
