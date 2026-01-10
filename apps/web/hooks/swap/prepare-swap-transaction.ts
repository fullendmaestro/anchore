import {
  CLPublicKey,
  CLValueBuilder,
  DeployUtil,
  RuntimeArgs,
} from "casper-js-sdk";
import { CASPER_CONFIG } from "../../lib/casper-config";
import { resolveContractHash } from "../../lib/casper-contracts";

// v2 implementation builds deploys directly with DeployUtil.

export const prepareSwapTransaction = async (
  params: {
    amount_in: string; // Amount in smallest unit (e.g., motes for CSPR)
    token_in: string; // Hash of the input token (with or without hash-)
    to: string; // Recipient account-hash hex (with or without hash-)
  },
  accountPublicKey: CLPublicKey,
  ammHash: string
): Promise<DeployUtil.Deploy> => {
  const stripHashPrefix = (hash: string): string =>
    hash.startsWith("hash-") ? hash.slice(5) : hash;

  const tokenInHex = stripHashPrefix(params.token_in);
  const toHex = stripHashPrefix(params.to);
  const ammHex = stripHashPrefix(ammHash);

  const tokenInBytes = Uint8Array.from(Buffer.from(tokenInHex, "hex"));
  const toBytes = Uint8Array.from(Buffer.from(toHex, "hex"));
  const resolvedAmmHex = await resolveContractHash(ammHex).catch(() => ammHex);
  const ammHashBytes = Uint8Array.from(Buffer.from(resolvedAmmHex, "hex"));

  const runtimeArgs = RuntimeArgs.fromMap({
    amount_in: CLValueBuilder.u256(params.amount_in),
    token_in: CLValueBuilder.byteArray(tokenInBytes),
    to: CLValueBuilder.byteArray(toBytes),
  });

  const deployParams = new DeployUtil.DeployParams(
    accountPublicKey,
    CASPER_CONFIG.CHAIN_NAME,
    1,
    1800000
  );

  const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
    ammHashBytes,
    "swap_exact_tokens",
    runtimeArgs
  );

  const payment = DeployUtil.standardPayment("3000000000");

  return DeployUtil.makeDeploy(deployParams, session, payment);
};

export const ensureHashPrefix = (hash: string): string =>
  hash.startsWith("hash-") ? hash : `hash-${hash}`;
