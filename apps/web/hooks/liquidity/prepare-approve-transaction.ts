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

export interface ApproveParams {
  spender: string; // pool contract hash
  amount: string; // in smallest units
  tokenHash: string; // token contract hash
}

/**
 * Prepare approve transaction for CEP-18 token
 * Following Casper JS SDK v5 patterns
 */
export async function prepareApproveTransaction(
  params: ApproveParams,
  senderPublicKey: PublicKey
): Promise<Deploy> {
  const { spender, amount, tokenHash } = params;

  const stripHashPrefix = (hash: string): string =>
    hash.startsWith("hash-") ? hash.slice(5) : hash;

  // Create deploy header
  const deployHeader = DeployHeader.default();
  deployHeader.account = senderPublicKey;
  deployHeader.chainName = "casper-test";
  deployHeader.ttl = new Duration(1800000); // 30 minutes
  deployHeader.timestamp = new Timestamp(new Date());

  // Create spender contract hash as Key
  const spenderHex = stripHashPrefix(spender);
  const spenderHash = Hash.fromHex(spenderHex);
  const spenderKey = new Key();
  spenderKey.hash = spenderHash;
  spenderKey.type = 1; // KeyTypeID.Hash

  // Prepare contract call arguments
  const contractArgs = Args.fromMap({
    spender: CLValue.newCLKey(spenderKey),
    amount: CLValue.newCLUInt256(BigInt(amount)),
  });

  // Create token contract package hash
  const tokenHex = stripHashPrefix(tokenHash);
  const contractPackageHash = ContractPackageHash.newContractPackage(tokenHex);

  // Create session (contract call)
  const session = new ExecutableDeployItem();
  session.storedVersionedContractByHash = new StoredVersionedContractByHash(
    contractPackageHash as any,
    "approve",
    contractArgs,
    undefined
  );

  // Payment: 3 CSPR (3_000_000_000 motes)
  const payment = ExecutableDeployItem.standardPayment("3000000000");

  // Create deploy
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  return deploy;
}
