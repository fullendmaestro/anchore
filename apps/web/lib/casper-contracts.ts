// Resolve a Casper contract package hash to the latest enabled contract hash via RPC proxy.
// Works on nodes that support query_global_state (even if state_get_contract_package is disabled).
export async function resolveContractHash(
  packageHash: string
): Promise<string> {
  const strip = (h: string) => (h.startsWith("hash-") ? h.slice(5) : h);
  const pkg = strip(packageHash);

  const rpc = async (method: string, params: any) => {
    const res = await fetch("/api/casper-rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
    });
    if (!res.ok) throw new Error(`RPC HTTP ${res.status}: ${res.statusText}`);
    const json = await res.json();
    if (json.error) throw new Error(`RPC Error: ${json.error.message}`);
    return json.result;
  };

  // 1) Get latest state root
  const { state_root_hash } = await rpc("chain_get_state_root_hash", {});

  // 2) Query the package value
  const queryRes = await rpc("query_global_state", {
    state_root_hash,
    key: `hash-${pkg}`,
    path: [],
  });

  const storedValue = queryRes?.stored_value;
  const contractPackage = storedValue?.ContractPackage;
  const versions: Array<any> = contractPackage?.versions || [];
  const enabled = versions.filter((v) => v.is_enabled);
  const chosen = (enabled.length ? enabled : versions)[versions.length - 1];
  const contractHash = chosen?.contract_hash;

  if (!contractHash) {
    throw new Error("Could not resolve contract hash from package");
  }

  return contractHash.startsWith("hash-")
    ? contractHash.slice(5)
    : contractHash;
}
