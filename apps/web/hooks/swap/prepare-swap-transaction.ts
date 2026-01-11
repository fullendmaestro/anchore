import {
  PublicKey,
  CLValue,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  StoredContractByHash,
  Args,
  Duration,
  Timestamp,
  ContractHash,
} from "casper-js-sdk";
import { CASPER_CONFIG } from "../../lib/casper-config";
import { resolveContractHash } from "../../lib/casper-contracts";

// v5 implementation builds deploys using Deploy.makeDeploy() static method.

export const prepareSwapTransaction = async (
  params: {
    amount_in: string; // Amount in smallest unit (e.g., motes for CSPR)
    token_in: string; // Hash of the input token (with or without hash-)
    to: string; // Recipient account-hash hex (with or without hash-)
  },
  accountPublicKey: PublicKey,
  ammHash: string
): Promise<Deploy> => {
  const stripHashPrefix = (hash: string): string =>
    hash.startsWith("hash-") ? hash.slice(5) : hash;

  const tokenInHex = stripHashPrefix(params.token_in);
  const toHex = stripHashPrefix(params.to);
  const ammHex = stripHashPrefix(ammHash);

  const tokenInBytes = Uint8Array.from(Buffer.from(tokenInHex, "hex"));
  const toBytes = Uint8Array.from(Buffer.from(toHex, "hex"));
  const resolvedAmmHex = await resolveContractHash(ammHex).catch(() => ammHex);
  const ammHashBytes = Uint8Array.from(Buffer.from(resolvedAmmHex, "hex"));

  const args = Args.fromMap({
    amount_in: CLValue.newCLUInt256(BigInt(params.amount_in)),
    token_in: CLValue.newCLByteArray(tokenInBytes),
    to: CLValue.newCLByteArray(toBytes),
  });

  const deployHeader = DeployHeader.default();
  deployHeader.account = accountPublicKey;
  deployHeader.chainName = CASPER_CONFIG.CHAIN_NAME;
  deployHeader.ttl = new Duration(1800000);
  deployHeader.timestamp = new Timestamp(new Date());

  const contractHash = ContractHash.newContract(resolvedAmmHex);
  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    contractHash,
    "swap_exact_tokens",
    args
  );

  const payment = ExecutableDeployItem.standardPayment("3000000000");

  return Deploy.makeDeploy(deployHeader, payment, session);
};

export const ensureHashPrefix = (hash: string): string =>
  hash.startsWith("hash-") ? hash : `hash-${hash}`;
