"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PublicKey, Deploy } from "casper-js-sdk";
import { useCasperWallet } from "@/lib/casper-wallet-provider";
import { submitDeployViaProxy } from "@/hooks/deploy-utils";
import { prepareApproveTransaction } from "@/hooks/liquidity/prepare-approve-transaction";
import { prepareSwapTransactionV2 } from "../_hooks/prepare-swap-transaction-v2";
import { TokenBase } from "@/data/types";

export enum SwapStep {
  IDLE = "idle",
  APPROVING = "approving",
  SWAPPING = "swapping",
  COMPLETE = "complete",
  ERROR = "error",
}

interface SwapState {
  step: SwapStep;
  deployHash: string | null;
  error: string | null;
}

interface SwapParams {
  sellToken: TokenBase;
  buyToken: TokenBase;
  amountIn: string; // in smallest units
  poolAddress: string;
}

export const useSwapWithApproval = () => {
  const { publicKey, provider } = useCasperWallet();
  const [state, setState] = useState<SwapState>({
    step: SwapStep.IDLE,
    deployHash: null,
    error: null,
  });

  const signAndSubmitDeploy = async (deploy: Deploy, pubKey: PublicKey) => {
    const pubKeyHex = pubKey.toHex();
    const deployJson: any = Deploy.toJSON(deploy);

    // Sign with wallet
    const signResult = await provider!.sign(
      JSON.stringify(deployJson),
      pubKeyHex
    );

    if (signResult.cancelled) {
      throw new Error("Transaction cancelled by user");
    }

    if (!signResult.signature) {
      throw new Error("Wallet did not return a signature");
    }

    // Helper to convert signature to hex
    const toHex = (
      u8: Uint8Array | number[] | Record<string, number>
    ): string => {
      let bytes: Uint8Array;
      if (u8 instanceof Uint8Array) {
        bytes = u8;
      } else if (Array.isArray(u8)) {
        bytes = new Uint8Array(u8);
      } else {
        bytes = new Uint8Array(Object.values(u8));
      }
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    };

    const algTag = pubKeyHex.slice(0, 2);
    const sigHex =
      typeof signResult.signature === "string"
        ? signResult.signature.startsWith("01") ||
          signResult.signature.startsWith("02")
          ? signResult.signature
          : algTag + signResult.signature
        : algTag + toHex(signResult.signature as any);

    // Merge approval into deploy JSON
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

    // Submit via proxy
    const result = await submitDeployViaProxy(signedDeployJson);
    return result.deploy_hash;
  };

  const executeSwap = async (params: SwapParams) => {
    if (!publicKey || !provider) {
      toast.error("Please connect your Casper wallet");
      return;
    }

    try {
      const pubKey = PublicKey.fromHex(publicKey.toString());
      const accountHashObj = pubKey.accountHash();
      const recipientHash = accountHashObj.toHex();

      // Step 1: Approve Sell Token
      setState({
        step: SwapStep.APPROVING,
        deployHash: null,
        error: null,
      });
      toast.info(`Approving ${params.sellToken.symbol}...`);

      const approveDeploy = await prepareApproveTransaction(
        {
          spender: params.poolAddress,
          amount: params.amountIn,
          tokenHash: params.sellToken.address,
        },
        pubKey
      );

      const approveHash = await signAndSubmitDeploy(approveDeploy, pubKey);
      toast.success(
        `${params.sellToken.symbol} approved! Hash: ${approveHash.slice(0, 10)}...`
      );

      // Wait for approval to propagate
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 2: Execute Swap
      setState({
        step: SwapStep.SWAPPING,
        deployHash: null,
        error: null,
      });
      toast.info("Executing swap...");

      const swapDeploy = await prepareSwapTransactionV2(
        {
          amountIn: params.amountIn,
          tokenIn: params.sellToken.address,
          minAmountOut: "0", // TODO: Calculate with slippage
          to: recipientHash,
          poolHash: params.poolAddress,
        },
        pubKey
      );

      const swapHash = await signAndSubmitDeploy(swapDeploy, pubKey);

      setState({
        step: SwapStep.COMPLETE,
        deployHash: swapHash,
        error: null,
      });

      toast.success(
        `Swap executed successfully! Deploy hash: ${swapHash.slice(0, 10)}...`
      );

      return swapHash;
    } catch (error: any) {
      console.error("Swap error:", error);
      setState({
        step: SwapStep.ERROR,
        deployHash: null,
        error: error.message || "Failed to execute swap",
      });
      toast.error(error.message || "Failed to execute swap");
    }
  };

  const reset = () => {
    setState({
      step: SwapStep.IDLE,
      deployHash: null,
      error: null,
    });
  };

  return {
    executeSwap,
    reset,
    state,
    isLoading:
      state.step === SwapStep.APPROVING || state.step === SwapStep.SWAPPING,
  };
};
