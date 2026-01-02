"use client";

import { useState } from "react";
import {
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  StoredContractByHash,
  PublicKey,
  ContractHash,
  Args,
  CLValue,
  Duration,
  Timestamp,
} from "casper-js-sdk";
import { useCasperWallet } from "@/lib/casper-wallet-provider";
import { CASPER_CONFIG } from "@/lib/casper-config";

// Helper to create RPC fetch client for SDK v5
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

export function useCasperContracts() {
  const { publicKey, provider } = useCasperWallet();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Bridge tokens from Casper to EVM
   */
  const bridgeToEVM = async (
    tokenHash: string,
    amount: string,
    evmRecipient: string
  ) => {
    if (!publicKey || !provider) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      // Create runtime arguments using Args.fromMap()
      const argsMap: Record<string, CLValue> = {
        token_hash: CLValue.newCLByteArray(
          Uint8Array.from(Buffer.from(tokenHash.replace("hash-", ""), "hex"))
        ),
        amount: CLValue.newCLUInt256(BigInt(amount)),
        evm_recipient: CLValue.newCLString(evmRecipient),
      };
      const args = Args.fromMap(argsMap);

      // Create payment logic
      const payment = ExecutableDeployItem.standardPayment("5000000000");

      // Create session logic with StoredContractByHash
      const contractHash = ContractHash.newContract(CASPER_CONFIG.BRIDGE_HASH);
      const session = new ExecutableDeployItem();
      session.storedContractByHash = new StoredContractByHash(
        contractHash,
        "bridge_to_evm",
        args
      );

      // Create deploy header
      const deployHeader = DeployHeader.default();
      deployHeader.account = PublicKey.fromHex(publicKey);
      deployHeader.chainName = CASPER_CONFIG.CHAIN_NAME;
      deployHeader.ttl = new Duration(1800000);
      deployHeader.gasPrice = 1;
      deployHeader.timestamp = new Timestamp(new Date());

      // Create deploy
      const deploy = Deploy.makeDeploy(deployHeader, payment, session);

      // Sign deploy with wallet
      const deployJson = Deploy.toJSON(deploy);
      const result = await provider.sign(JSON.stringify(deployJson), publicKey);

      if (result.cancelled) {
        throw new Error("Signature cancelled by user");
      }

      // Send deploy to network
      const rpcClient = createRpcClient();
      const signedDeployJson = JSON.parse(result.signedDeploy || "{}");
      const deployResult = await rpcClient.send("account_put_deploy", {
        deploy: signedDeployJson,
      });

      return deployResult.deploy_hash;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add liquidity to AMM pool
   */
  const addLiquidity = async (
    tokenAHash: string,
    tokenBHash: string,
    amountA: string,
    amountB: string
  ) => {
    if (!publicKey || !provider) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      const argsMap: Record<string, CLValue> = {
        token_a: CLValue.newCLByteArray(
          Uint8Array.from(Buffer.from(tokenAHash.replace("hash-", ""), "hex"))
        ),
        token_b: CLValue.newCLByteArray(
          Uint8Array.from(Buffer.from(tokenBHash.replace("hash-", ""), "hex"))
        ),
        amount_a: CLValue.newCLUInt256(BigInt(amountA)),
        amount_b: CLValue.newCLUInt256(BigInt(amountB)),
        min_liquidity: CLValue.newCLUInt256(BigInt(0)),
      };
      const args = Args.fromMap(argsMap);

      const payment = ExecutableDeployItem.standardPayment("10000000000");

      const contractHash = ContractHash.newContract(CASPER_CONFIG.AMM_HASH);
      const session = new ExecutableDeployItem();
      session.storedContractByHash = new StoredContractByHash(
        contractHash,
        "add_liquidity",
        args
      );

      const deployHeader = DeployHeader.default();
      deployHeader.account = PublicKey.fromHex(publicKey);
      deployHeader.chainName = CASPER_CONFIG.CHAIN_NAME;
      deployHeader.ttl = new Duration(1800000);
      deployHeader.gasPrice = 1;
      deployHeader.timestamp = new Timestamp(new Date());

      const deploy = Deploy.makeDeploy(deployHeader, payment, session);
      const deployJson = Deploy.toJSON(deploy);
      const result = await provider.sign(JSON.stringify(deployJson), publicKey);

      if (result.cancelled) {
        throw new Error("Signature cancelled by user");
      }

      const rpcClient = createRpcClient();
      const signedDeployJson = JSON.parse(result.signedDeploy || "{}");
      const deployResult = await rpcClient.send("account_put_deploy", {
        deploy: signedDeployJson,
      });

      return deployResult.deploy_hash;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove liquidity from AMM pool
   */
  const removeLiquidity = async (
    tokenAHash: string,
    tokenBHash: string,
    liquidity: string,
    minAmountA: string,
    minAmountB: string
  ) => {
    if (!publicKey || !provider) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      const argsMap: Record<string, CLValue> = {
        token_a: CLValue.newCLByteArray(
          Uint8Array.from(Buffer.from(tokenAHash.replace("hash-", ""), "hex"))
        ),
        token_b: CLValue.newCLByteArray(
          Uint8Array.from(Buffer.from(tokenBHash.replace("hash-", ""), "hex"))
        ),
        liquidity: CLValue.newCLUInt256(BigInt(liquidity)),
        min_amount_a: CLValue.newCLUInt256(BigInt(minAmountA)),
        min_amount_b: CLValue.newCLUInt256(BigInt(minAmountB)),
      };
      const args = Args.fromMap(argsMap);

      const payment = ExecutableDeployItem.standardPayment("10000000000");

      const contractHash = ContractHash.newContract(CASPER_CONFIG.AMM_HASH);
      const session = new ExecutableDeployItem();
      session.storedContractByHash = new StoredContractByHash(
        contractHash,
        "remove_liquidity",
        args
      );

      const deployHeader = DeployHeader.default();
      deployHeader.account = PublicKey.fromHex(publicKey);
      deployHeader.chainName = CASPER_CONFIG.CHAIN_NAME;
      deployHeader.ttl = new Duration(1800000);
      deployHeader.gasPrice = 1;
      deployHeader.timestamp = new Timestamp(new Date());

      const deploy = Deploy.makeDeploy(deployHeader, payment, session);
      const deployJson = Deploy.toJSON(deploy);
      const result = await provider.sign(JSON.stringify(deployJson), publicKey);

      if (result.cancelled) {
        throw new Error("Signature cancelled by user");
      }

      const rpcClient = createRpcClient();
      const signedDeployJson = JSON.parse(result.signedDeploy || "{}");
      const deployResult = await rpcClient.send("account_put_deploy", {
        deploy: signedDeployJson,
      });

      return deployResult.deploy_hash;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Swap tokens on AMM
   */
  const swapTokens = async (
    tokenInHash: string,
    tokenOutHash: string,
    amountIn: string,
    minAmountOut: string
  ) => {
    if (!publicKey || !provider) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      // Create runtime arguments using Args.fromMap()
      const argsMap: Record<string, CLValue> = {
        token_in: CLValue.newCLByteArray(
          Uint8Array.from(Buffer.from(tokenInHash.replace("hash-", ""), "hex"))
        ),
        token_out: CLValue.newCLByteArray(
          Uint8Array.from(Buffer.from(tokenOutHash.replace("hash-", ""), "hex"))
        ),
        amount_in: CLValue.newCLUInt256(BigInt(amountIn)),
        min_amount_out: CLValue.newCLUInt256(BigInt(minAmountOut)),
      };
      const args = Args.fromMap(argsMap);

      // Create payment logic (standard payment)
      const payment = ExecutableDeployItem.standardPayment("5000000000");

      // Create session logic with StoredContractByHash
      const contractHash = ContractHash.newContract(CASPER_CONFIG.AMM_HASH);
      const session = new ExecutableDeployItem();
      session.storedContractByHash = new StoredContractByHash(
        contractHash,
        "swap_exact_tokens",
        args
      );

      // Create deploy header
      const deployHeader = DeployHeader.default();
      deployHeader.account = PublicKey.fromHex(publicKey);
      deployHeader.chainName = CASPER_CONFIG.CHAIN_NAME;
      deployHeader.ttl = new Duration(1800000); // 30 minutes
      deployHeader.gasPrice = 1;
      deployHeader.timestamp = new Timestamp(new Date());

      // Create deploy using Deploy.makeDeploy()
      const deploy = Deploy.makeDeploy(deployHeader, payment, session);

      // Sign deploy with wallet
      const deployJson = Deploy.toJSON(deploy);
      const result = await provider.sign(JSON.stringify(deployJson), publicKey);

      if (result.cancelled) {
        throw new Error("Signature cancelled by user");
      }

      // Send deploy to network using RPC
      const rpcClient = createRpcClient();
      const signedDeployJson = JSON.parse(result.signedDeploy || "{}");
      const deployResult = await rpcClient.send("account_put_deploy", {
        deploy: signedDeployJson,
      });

      return deployResult.deploy_hash;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get deploy status
   */
  const getDeployStatus = async (deployHash: string) => {
    try {
      const rpcClient = createRpcClient();
      const result = await rpcClient.send("info_get_deploy", {
        deploy_hash: deployHash,
      });
      return {
        deploy: result.deploy,
        executionResults: result.execution_results,
      };
    } catch (error) {
      console.error("Failed to get deploy status:", error);
      throw error;
    }
  };

  return {
    bridgeToEVM,
    addLiquidity,
    removeLiquidity,
    swapTokens,
    getDeployStatus,
    isLoading,
  };
}
