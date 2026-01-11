"use client";

import { CASPER_CHAIN_ID, TOKENS } from "@/data";
import { TokenBase } from "@/data/types";
import { useCasperWallet } from "@/lib/casper-wallet-provider";
import { useState } from "react";
import { toast } from "sonner";
import { prepareMintTransaction } from "./prepare-mint-transaction";
import { PublicKey, Deploy } from "casper-js-sdk";

import { submitDeployViaProxy } from "../deploy-utils";

interface FaucetResult {
  data: { deployHash: string } | null;
  loading: boolean;
  cancelled: boolean;
  error: boolean;
}

export const useFaucet = () => {
  const { publicKey, provider } = useCasperWallet();
  const [faucetResult, setFaucetResult] = useState<FaucetResult>({
    data: null,
    loading: false,
    cancelled: false,
    error: false,
  });

  const requestTokens = async (token: TokenBase, amount: string) => {
    if (token.chainId !== CASPER_CHAIN_ID) {
      toast.error("Only Casper testnet tokens are supported");
      return;
    }

    if (!publicKey) {
      toast.error("Connect Casper wallet to request tokens");
      return;
    }

    if (!provider) {
      toast.error("Wallet provider not available");
      return;
    }

    try {
      console.log("Preparing mint transaction...");

      // Parse public key ONCE and reuse the instance
      const pubKeyHex = publicKey.toString();
      const pubKey = PublicKey.fromHex(pubKeyHex);
      const accountHashObj = pubKey.accountHash();
      const recipientHash = accountHashObj.toHex(); // Get the hex string from AccountHash

      const deploy = await prepareMintTransaction(
        {
          amount,
          to: recipientHash,
        },
        pubKey,
        token.address
      );

      console.log("Prepared mint deploy:", deploy);

      setFaucetResult({
        data: null,
        loading: true,
        cancelled: false,
        error: false,
      });

      // Convert deploy to JSON for wallet signing
      const deployJson: any = Deploy.toJSON(deploy);
      toast.info("Please sign the transaction in your wallet");
      const signResult = await provider.sign(
        JSON.stringify(deployJson),
        pubKeyHex
      );

      if (signResult.cancelled) {
        setFaucetResult({
          data: null,
          loading: false,
          cancelled: true,
          error: false,
        });
        toast.info("Transaction cancelled");
        return;
      }

      if (!signResult.signature) {
        throw new Error("Wallet did not return a signature");
      }

      const toHex = (
        u8: Uint8Array | number[] | Record<string, number>
      ): string => {
        let bytes: Uint8Array;
        if (u8 instanceof Uint8Array) {
          bytes = u8;
        } else if (Array.isArray(u8)) {
          bytes = new Uint8Array(u8);
        } else if (typeof u8 === "object") {
          const arr = Object.keys(u8)
            .map((k) => ({ k: Number(k), v: (u8 as any)[k] }))
            .sort((a, b) => a.k - b.k)
            .map((x) => x.v);
          bytes = new Uint8Array(arr);
        } else {
          throw new Error("Unsupported signature format");
        }
        return Buffer.from(bytes).toString("hex");
      };

      const algTag = pubKeyHex.slice(0, 2);
      const sigHex =
        typeof signResult.signature === "string"
          ? signResult.signature.startsWith("01") ||
            signResult.signature.startsWith("02")
            ? signResult.signature
            : algTag + signResult.signature
          : algTag + toHex(signResult.signature as any);

      // Merge approval into the correct object: unwrap if deployJson has {deploy: {...}}
      let signedDeployJson: any;
      if ((deployJson as any).deploy) {
        const inner = (deployJson as any).deploy;
        signedDeployJson = {
          ...inner,
          approvals: [
            ...(inner.approvals || []),
            { signer: pubKeyHex, signature: sigHex },
          ],
        };
      } else {
        signedDeployJson = {
          ...deployJson,
          approvals: [
            ...((deployJson as any).approvals || []),
            { signer: pubKeyHex, signature: sigHex },
          ],
        };
      }

      toast.info("Submitting transaction to network...");
      const result = await submitDeployViaProxy(signedDeployJson);

      const deployHash = result.deploy_hash;

      setFaucetResult({
        data: { deployHash },
        loading: false,
        cancelled: false,
        error: false,
      });

      toast.success(`Tokens requested successfully: ${deployHash}`);
    } catch (error) {
      console.error("Faucet error:", error);
      setFaucetResult({
        data: null,
        loading: false,
        cancelled: false,
        error: true,
      });
      toast.error(
        error instanceof Error ? error.message : "Faucet request failed"
      );
    }
  };

  const resetFaucet = () => {
    setFaucetResult({
      data: null,
      loading: false,
      cancelled: false,
      error: false,
    });
  };

  return {
    requestTokens,
    resetFaucet,
    faucetResult,
    isLoading: faucetResult.loading,
    isError: faucetResult.error,
    isCancelled: faucetResult.cancelled,
  };
};
