"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PublicKey, Deploy } from "casper-js-sdk";
import { useCasperWallet } from "@/lib/casper-wallet-provider";
import { submitDeployViaProxy } from "../deploy-utils";
import { prepareApproveTransaction } from "./prepare-approve-transaction";
import { prepareAddLiquidityTransaction } from "./prepare-add-liquidity-transaction";
import { LiquidityPool } from "@/data/pools";

export enum AddLiquidityStep {
  IDLE = "idle",
  APPROVING_TOKEN0 = "approving_token0",
  APPROVING_TOKEN1 = "approving_token1",
  ADDING_LIQUIDITY = "adding_liquidity",
  COMPLETE = "complete",
  ERROR = "error",
}

interface AddLiquidityState {
  step: AddLiquidityStep;
  deployHash: string | null;
  error: string | null;
}

export const useAddLiquidity = () => {
  const { publicKey, provider } = useCasperWallet();
  const [state, setState] = useState<AddLiquidityState>({
    step: AddLiquidityStep.IDLE,
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

  const addLiquidity = async (
    pool: LiquidityPool,
    amount0: string,
    amount1: string
  ) => {
    if (!publicKey || !provider) {
      toast.error("Please connect your Casper wallet");
      return;
    }

    try {
      const pubKey = PublicKey.fromHex(publicKey.toString());

      // Step 1: Approve Token0
      setState({
        step: AddLiquidityStep.APPROVING_TOKEN0,
        deployHash: null,
        error: null,
      });
      toast.info(`Approving ${pool.token0Symbol}...`);

      const approve0Deploy = await prepareApproveTransaction(
        {
          spender: pool.address,
          amount: amount0,
          tokenHash: pool.token0Address,
        },
        pubKey
      );

      const approve0Hash = await signAndSubmitDeploy(approve0Deploy, pubKey);
      toast.success(
        `${pool.token0Symbol} approved! Hash: ${approve0Hash.slice(0, 10)}...`
      );

      // Wait a bit for transaction to propagate
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 2: Approve Token1
      setState({
        step: AddLiquidityStep.APPROVING_TOKEN1,
        deployHash: null,
        error: null,
      });
      toast.info(`Approving ${pool.token1Symbol}...`);

      const approve1Deploy = await prepareApproveTransaction(
        {
          spender: pool.address,
          amount: amount1,
          tokenHash: pool.token1Address,
        },
        pubKey
      );

      const approve1Hash = await signAndSubmitDeploy(approve1Deploy, pubKey);
      toast.success(
        `${pool.token1Symbol} approved! Hash: ${approve1Hash.slice(0, 10)}...`
      );

      // Wait a bit for transaction to propagate
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 3: Add Liquidity
      setState({
        step: AddLiquidityStep.ADDING_LIQUIDITY,
        deployHash: null,
        error: null,
      });
      toast.info("Adding liquidity to pool...");

      const addLiquidityDeploy = await prepareAddLiquidityTransaction(
        {
          amount0,
          amount1,
          poolHash: pool.address,
        },
        pubKey
      );

      const liquidityHash = await signAndSubmitDeploy(
        addLiquidityDeploy,
        pubKey
      );

      setState({
        step: AddLiquidityStep.COMPLETE,
        deployHash: liquidityHash,
        error: null,
      });

      toast.success(
        `Liquidity added successfully! Deploy hash: ${liquidityHash.slice(0, 10)}...`
      );

      return liquidityHash;
    } catch (error: any) {
      console.error("Add liquidity error:", error);
      setState({
        step: AddLiquidityStep.ERROR,
        deployHash: null,
        error: error.message || "Failed to add liquidity",
      });
      toast.error(error.message || "Failed to add liquidity");
    }
  };

  const reset = () => {
    setState({
      step: AddLiquidityStep.IDLE,
      deployHash: null,
      error: null,
    });
  };

  return {
    addLiquidity,
    reset,
    state,
    isLoading:
      state.step === AddLiquidityStep.APPROVING_TOKEN0 ||
      state.step === AddLiquidityStep.APPROVING_TOKEN1 ||
      state.step === AddLiquidityStep.ADDING_LIQUIDITY,
  };
};
