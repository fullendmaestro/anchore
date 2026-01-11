import {
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  StoredVersionedContractByHash,
  PublicKey,
  ContractPackageHash,
  Hash,
  Args,
  CLValue,
  Duration,
  Timestamp,
  Key,
} from "casper-js-sdk";

export interface SwapParams {
  amountIn: string; // in smallest units
  tokenIn: string; // token contract package hash
  minAmountOut?: string; // minimum output amount (optional, defaults to 0)
  to: string; // recipient account hash hex
  poolHash: string; // pool contract package hash
}

/**
 * Prepare swap transaction for Anchore Pool contract
 * Using contract package hashes (not contract hashes)
 * Following Casper JS SDK v5 patterns
 */
export async function prepareSwapTransactionV2(
  params: SwapParams,
  senderPublicKey: PublicKey
): Promise<Deploy> {
  const { amountIn, tokenIn, minAmountOut, to, poolHash } = params;

  const stripHashPrefix = (hash: string): string =>
    hash.startsWith("hash-") ? hash.slice(5) : hash;

  // Create deploy header
  const deployHeader = DeployHeader.default();
  deployHeader.account = senderPublicKey;
  deployHeader.chainName = "casper-test";
  deployHeader.ttl = new Duration(1800000); // 30 minutes
  deployHeader.timestamp = new Timestamp(new Date());

  // Create token_in as Key (Hash type)
  const tokenInHex = stripHashPrefix(tokenIn);
  const tokenInHash = Hash.fromHex(tokenInHex);
  const tokenInKey = new Key();
  tokenInKey.hash = tokenInHash;
  tokenInKey.type = 1; // KeyTypeID.Hash

  // Create recipient as Key (Hash type for account hash)
  const toHex = stripHashPrefix(to);
  const toHash = Hash.fromHex(toHex);
  const toKey = new Key();
  toKey.hash = toHash;
  toKey.type = 1; // KeyTypeID.Hash (account hash is also a hash)

  // Prepare contract call arguments
  const contractArgs = Args.fromMap({
    amount_in: CLValue.newCLUInt256(BigInt(amountIn)),
    token_in: CLValue.newCLKey(tokenInKey),
    min_amount_out: CLValue.newCLUInt256(BigInt(minAmountOut || "0")),
    to: CLValue.newCLKey(toKey),
  });

  // Create pool contract package hash
  const poolHex = stripHashPrefix(poolHash);
  const contractPackageHash = ContractPackageHash.newContractPackage(poolHex);

  // Create session (contract call)
  const session = new ExecutableDeployItem();
  session.storedVersionedContractByHash = new StoredVersionedContractByHash(
    contractPackageHash as any,
    "swap_exact_tokens_in",
    contractArgs,
    undefined
  );

  // Payment: 5 CSPR (5_000_000_000 motes)
  const payment = ExecutableDeployItem.standardPayment("5000000000");

  // Create deploy
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  return deploy;
}
