import {
  PublicKey,
  CLValue,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  StoredVersionedContractByHash,
  Args,
  Duration,
  Timestamp,
  ContractPackageHash,
  Key,
  AccountHash,
} from "casper-js-sdk";
import { CASPER_CONFIG } from "../../lib/casper-config";

export const prepareMintTransaction = async (
  params: {
    amount: string; // Amount in smallest unit
    to: string; // Recipient account-hash hex
  },
  accountPublicKey: PublicKey,
  tokenHash: string // This is the Contract Package Hash
): Promise<Deploy> => {
  const stripHashPrefix = (hash: string): string =>
    hash.startsWith("hash-") ? hash.slice(5) : hash;

  const toHex = stripHashPrefix(params.to);
  const tokenHex = stripHashPrefix(tokenHash);

  // Build a Key::Account from the account hash
  const recipientAccountHash = AccountHash.fromString(toHex);
  const recipientKey = new Key();
  recipientKey.account = recipientAccountHash;
  recipientKey.type = 0; // KeyTypeID.Account

  // Updated for CEP-18 module: parameter name is 'recipient', not 'to'
  const args = Args.fromMap({
    recipient: CLValue.newCLKey(recipientKey),
    amount: CLValue.newCLUInt256(BigInt(params.amount)),
  });

  const deployHeader = DeployHeader.default();
  deployHeader.account = accountPublicKey;
  deployHeader.chainName = CASPER_CONFIG.CHAIN_NAME;
  deployHeader.ttl = new Duration(1800000);
  deployHeader.timestamp = new Timestamp(new Date());

  // Use StoredVersionedContractByHash for Package Hashes
  const contractPackageHash = ContractPackageHash.newContractPackage(tokenHex);
  const session = new ExecutableDeployItem();
  session.storedVersionedContractByHash = new StoredVersionedContractByHash(
    contractPackageHash as any, // The hash parameter expects ContractHash, but package hash works here
    "mint",
    args,
    undefined // Passing undefined automatically selects the latest enabled version
  );

  const payment = ExecutableDeployItem.standardPayment("7500000000");

  return Deploy.makeDeploy(deployHeader, payment, session);
};
