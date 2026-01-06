"use client";

import { CASPER_CHAIN_ID } from "@/data";
import { CASPER_SWAP_ROUTES } from "@/data/swap-and-bridge-routes";
import { TokenBase } from "@/data/types";
import { CASPER_CONFIG } from "@/lib/casper-config";
import { useCasperWallet } from "@/lib/casper-wallet-provider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  prepareSwapTransaction,
  PreparedSwapTransaction,
  buildSwapRuntimeArgs,
  ensureHashPrefix,
} from "./prepare-swap-transaction";
import {
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  StoredContractByHash,
  PublicKey,
  ContractHash,
  Duration,
  Timestamp,
} from "casper-js-sdk";

type SwapParams = {
  sellToken: TokenBase;
  buyToken: TokenBase;
  amountIn: string;
  expectedAmountOut?: string;
  slippageBps?: number;
};

type SwapExecutionResult = {
  deployHash: string;
  prepared: PreparedSwapTransaction;
};

const createRpcClient = () => {
  const rpcUrl = CASPER_CONFIG.NODE_URL;
  return {
    async send(method: string, params: any) {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.result;
    },
  };
};

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

  return useMutation<SwapExecutionResult | null, Error, SwapParams>({
    mutationKey: ["swap"],
    mutationFn: async ({
      sellToken,
      buyToken,
      amountIn,
      expectedAmountOut,
      slippageBps,
    }) => {
      const isCasperPair =
        sellToken.chainId === CASPER_CHAIN_ID &&
        buyToken.chainId === CASPER_CHAIN_ID;

      if (!isCasperPair) {
        toast.info("Bridging coming soon");
        return null;
      }

      const poolAddress = findPoolAddress(sellToken.address, buyToken.address);

      if (!poolAddress) {
        toast.error("Route not found for selected pair");
        return null;
      }

      if (!publicKey || !provider) {
        throw new Error("Connect Casper wallet to submit swaps");
      }

      const prepared = prepareSwapTransaction({
        poolAddress,
        sellToken,
        buyToken,
        amountIn,
        expectedAmountOut,
        slippageBps,
      });

      console.log("", {
        poolAddress,
        sellToken,
        buyToken,
        amountIn,
        expectedAmountOut,
        slippageBps,
      });

      console.log("prepare", prepared);

      const runtimeArgs = buildSwapRuntimeArgs(prepared);
      const payment = ExecutableDeployItem.standardPayment("5000000000");

      const contractHash = ContractHash.newContract(
        ensureHashPrefix(prepared.poolAddress)
      );
      const session = new ExecutableDeployItem();
      session.storedContractByHash = new StoredContractByHash(
        contractHash,
        "swap_exact_tokens",
        runtimeArgs
      );

      const deployHeader = DeployHeader.default();
      deployHeader.account = PublicKey.fromHex(publicKey);
      deployHeader.chainName = CASPER_CONFIG.CHAIN_NAME;
      deployHeader.ttl = new Duration(1_800_000);
      deployHeader.gasPrice = 1;
      deployHeader.timestamp = new Timestamp(new Date());

      const deploy = Deploy.makeDeploy(deployHeader, payment, session);
      const deployJson = Deploy.toJSON(deploy);
      const signed = await provider.sign(JSON.stringify(deployJson), publicKey);

      if (signed.cancelled) {
        throw new Error("Signature cancelled by user");
      }

      const rpcClient = createRpcClient();
      const signedDeployJson = JSON.parse(signed.signedDeploy || "{}");
      const submitResult = await rpcClient.send("account_put_deploy", {
        deploy: signedDeployJson,
      });

      toast.success("Swap submitted on Casper");
      return { deployHash: submitResult.deploy_hash, prepared };
    },
    onError: (error) => {
      toast.error(error.message || "Swap failed");
    },
  });
};
