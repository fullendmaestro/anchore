import {
  CLPublicKey,
  CLValueBuilder,
  DeployUtil,
  RuntimeArgs,
} from "casper-js-sdk";
import { CASPER_CONFIG } from "../../lib/casper-config";
import { resolveContractHash } from "../../lib/casper-contracts";

export const prepareMintTransaction = async (
  params: {
    amount: string; // Amount in smallest unit
    to: string; // Recipient account-hash hex (with or without prefix)
  },
  accountPublicKey: CLPublicKey,
  tokenHash: string
): Promise<DeployUtil.Deploy> => {
  const stripHashPrefix = (hash: string): string =>
    hash.startsWith("hash-") ? hash.slice(5) : hash;

  const toHex = stripHashPrefix(params.to);
  const tokenHex = stripHashPrefix(tokenHash);

  const toBytes = Uint8Array.from(Buffer.from(toHex, "hex"));
  // Resolve contract hash if a package hash was supplied
  const resolvedHashHex = await resolveContractHash(tokenHex).catch(
    () => tokenHex
  );
  const tokenHashBytes = Uint8Array.from(Buffer.from(resolvedHashHex, "hex"));

  // Odra Address = Casper Key type (Account or Contract)
  // Build a Key::Account from the account hash
  const toKey = CLValueBuilder.key(CLValueBuilder.byteArray(toBytes));

  const runtimeArgs = RuntimeArgs.fromMap({
    to: toKey,
    amount: CLValueBuilder.u256(params.amount),
  });

  const deployParams = new DeployUtil.DeployParams(
    accountPublicKey,
    CASPER_CONFIG.CHAIN_NAME,
    1,
    1800000
  );

  const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
    tokenHashBytes,
    "mint",
    runtimeArgs
  );

  const payment = DeployUtil.standardPayment("7500000000");

  return DeployUtil.makeDeploy(deployParams, session, payment);
};
