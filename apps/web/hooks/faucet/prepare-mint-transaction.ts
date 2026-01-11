import {
  CLPublicKey,
  CLValueBuilder,
  DeployUtil,
  RuntimeArgs,
} from "casper-js-sdk";
import { CASPER_CONFIG } from "../../lib/casper-config";

export const prepareMintTransaction = async (
  params: {
    amount: string; // Amount in smallest unit
    to: string; // Recipient account-hash hex
  },
  accountPublicKey: CLPublicKey,
  tokenHash: string // This is the Contract Package Hash
): Promise<DeployUtil.Deploy> => {
  const stripHashPrefix = (hash: string): string =>
    hash.startsWith("hash-") ? hash.slice(5) : hash;

  const toHex = stripHashPrefix(params.to);
  const tokenHex = stripHashPrefix(tokenHash);

  // Prepare byte arrays
  const toBytes = Uint8Array.from(Buffer.from(toHex, "hex"));
  const tokenPackageHashBytes = Uint8Array.from(Buffer.from(tokenHex, "hex"));

  // Build a Key::Account from the account hash
  const recipientKey = CLValueBuilder.key(CLValueBuilder.byteArray(toBytes));

  // Updated for CEP-18 module: parameter name is 'recipient', not 'to'
  const runtimeArgs = RuntimeArgs.fromMap({
    recipient: recipientKey,
    amount: CLValueBuilder.u256(params.amount),
  });

  const deployParams = new DeployUtil.DeployParams(
    accountPublicKey,
    CASPER_CONFIG.CHAIN_NAME,
    1,
    1800000
  );

  // CORRECT WAY: Use newStoredVersionContractByHash for Package Hashes
  const session =
    DeployUtil.ExecutableDeployItem.newStoredVersionContractByHash(
      tokenPackageHashBytes,
      null, // Passing null automatically selects the latest enabled version
      "mint",
      runtimeArgs
    );

  const payment = DeployUtil.standardPayment("7500000000");

  return DeployUtil.makeDeploy(deployParams, session, payment);
};
