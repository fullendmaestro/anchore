"use client";

import { CASPER_CHAIN_ID } from "@/data";
import { CASPER_SWAP_ROUTES } from "@/data/swap-and-bridge-routes";
import { TokenBase } from "@/data/types";
import { CASPER_CONFIG } from "@/lib/casper-config";
import { useCasperWallet } from "@/lib/casper-wallet-provider";
import { useState } from "react";
import { toast } from "sonner";
import { prepareSwapTransaction } from "./prepare-swap-transaction";
import { PublicKey, Deploy } from "casper-js-sdk";
import { submitDeployViaProxy } from "../deploy-utils";

type SwapParams = {
  sellToken: TokenBase;
  buyToken: TokenBase;
  amountIn: string;
  expectedAmountOut?: string;
  slippageBps?: number;
};

type SwapExecutionResult = {
  deployHash: string;
  prepared: Deploy;
};

interface SwapResult {
  data: SwapExecutionResult | null;
  loading: boolean;
  cancelled: boolean;
  error: boolean;
}

const findPoolAddress = (sellTokenAddress: string, buyTokenAddress: string) =>
  CASPER_SWAP_ROUTES.find(
    (route) =>
      (route.token0Address === sellTokenAddress &&
        route.token1Address === buyTokenAddress) ||
      (route.token1Address === sellTokenAddress &&
        route.token0Address === buyTokenAddress)
  )?.poolAddress;

export const useSwap = () => {
  const { publicKey, provider } = useCasperWallet();
  const [swapResult, setSwapResult] = useState<SwapResult>({
    data: null,
    loading: false,
    cancelled: false,
    error: false,
  });

  const executeSwap = async (params: SwapParams) => {
    const { sellToken, buyToken, amountIn, expectedAmountOut, slippageBps } =
      params;

    const isCasperPair =
      sellToken.chainId === CASPER_CHAIN_ID &&
      buyToken.chainId === CASPER_CHAIN_ID;

    if (!isCasperPair) {
      toast.info("Bridging coming soon");
      return;
    }

    const poolAddress = findPoolAddress(sellToken.address, buyToken.address);

    if (!poolAddress) {
      toast.error("Route not found for selected pair");
      return;
    }

    if (!publicKey) {
      toast.error("Connect Casper wallet to submit swaps");
      return;
    }

    if (!provider) {
      toast.error("Wallet provider not available");
      return;
    }

    try {
      console.log("Preparing swap transaction...");

      // Convert publicKey to account hash for recipient address
      const pubKey = PublicKey.fromHex(publicKey.toString());
      const accountHashObj = pubKey.accountHash();
      const accountHash = accountHashObj.toHex(); // Get the hex string from AccountHash

      // Prepare deploy
      const deploy = await prepareSwapTransaction(
        {
          amount_in: amountIn,
          token_in: sellToken.address,
          to: accountHash,
        },
        pubKey,
        poolAddress
      );

      console.log("Prepared deploy:", deploy);

      setSwapResult({
        data: null,
        loading: true,
        cancelled: false,
        error: false,
      });

      // Convert deploy to JSON for wallet signing
      const deployJson: any = Deploy.toJSON(deploy);

      // Sign with wallet provider
      toast.info("Please sign the transaction in your wallet");
      const signResult = await provider.sign(
        JSON.stringify(deployJson),
        publicKey.toString()
      );

      if (signResult.cancelled) {
        setSwapResult({
          data: null,
          loading: false,
          cancelled: true,
          error: false,
        });
        toast.info("Transaction cancelled");
        return;
      }

      // Attach wallet signature to deploy JSON (v2 flow)
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

      const signerHex = publicKey.toString();
      const algTag = signerHex.slice(0, 2); // '01' for Ed25519, '02' for Secp256k1
      const sigHex =
        typeof signResult.signature === "string"
          ? signResult.signature.startsWith("01") ||
            signResult.signature.startsWith("02")
            ? signResult.signature
            : algTag + signResult.signature
          : algTag + toHex(signResult.signature as any);

      // Merge approval into correct location.
      // deployJson may be either {deploy: {...}} or the flat object itself.
      let signedDeployJson: any;
      if ((deployJson as any).deploy) {
        const inner = (deployJson as any).deploy;
        signedDeployJson = {
          ...inner,
          approvals: [
            ...(inner.approvals || []),
            { signer: signerHex, signature: sigHex },
          ],
        };
      } else {
        signedDeployJson = {
          ...deployJson,
          approvals: [
            ...((deployJson as any).approvals || []),
            { signer: signerHex, signature: sigHex },
          ],
        };
      }

      toast.info("Submitting transaction to network...");
      console.log("Signed deploy JSON:", signedDeployJson);

      const result = await submitDeployViaProxy(signedDeployJson);
      const deployHash = result.deploy_hash;

      setSwapResult({
        data: { deployHash, prepared: deploy },
        loading: false,
        cancelled: false,
        error: false,
      });

      toast.success(`Swap transaction submitted: ${deployHash}`);
    } catch (error) {
      setSwapResult({
        data: null,
        loading: false,
        cancelled: false,
        error: true,
      });
      toast.error(error instanceof Error ? error.message : "Swap failed");
    }
  };

  const resetSwap = () => {
    setSwapResult({
      data: null,
      loading: false,
      cancelled: false,
      error: false,
    });
  };

  return {
    executeSwap,
    resetSwap,
    swapResult,
    isLoading: swapResult.loading,
    isError: swapResult.error,
    isCancelled: swapResult.cancelled,
  };
};
