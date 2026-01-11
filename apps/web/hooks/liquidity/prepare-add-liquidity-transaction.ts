import {
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  StoredVersionedContractByHash,
  PublicKey,
  ContractPackageHash,
  Args,
  CLValue,
  Duration,
  Timestamp,
} from "casper-js-sdk";

export interface AddLiquidityParams {
  amount0: string; // in smallest units
  amount1: string; // in smallest units
  poolHash: string;
}

/**
 * Prepare add_liquidity transaction for Anchore Pool contract
 * Following Casper JS SDK v5 patterns
 */
export async function prepareAddLiquidityTransaction(
  params: AddLiquidityParams,
  senderPublicKey: PublicKey
): Promise<Deploy> {
  const { amount0, amount1, poolHash } = params;

  const stripHashPrefix = (hash: string): string =>
    hash.startsWith("hash-") ? hash.slice(5) : hash;

  // Create deploy header
  const deployHeader = DeployHeader.default();
  deployHeader.account = senderPublicKey;
  deployHeader.chainName = "casper-test";
  deployHeader.ttl = new Duration(1800000); // 30 minutes
  deployHeader.timestamp = new Timestamp(new Date());

  // Prepare contract call arguments
  const contractArgs = Args.fromMap({
    amount_a: CLValue.newCLUInt256(BigInt(amount0)),
    amount_b: CLValue.newCLUInt256(BigInt(amount1)),
  });

  // Create contract package hash
  const poolHex = stripHashPrefix(poolHash);
  const contractPackageHash = ContractPackageHash.newContractPackage(poolHex);

  // Create session (contract call)
  const session = new ExecutableDeployItem();
  session.storedVersionedContractByHash = new StoredVersionedContractByHash(
    contractPackageHash as any,
    "add_liquidity",
    contractArgs,
    undefined
  );

  // Payment: 5 CSPR (5_000_000_000 motes)
  const payment = ExecutableDeployItem.standardPayment("5000000000");

  // Create deploy
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  return deploy;
}
