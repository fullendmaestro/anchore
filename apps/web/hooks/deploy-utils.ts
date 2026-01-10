// Helper: Submit deploy via API proxy
export async function submitDeployViaProxy(signedDeploy: any) {
  console.log("Submitting deploy via proxy:", signedDeploy);

  const makeBody = (params: any) =>
    JSON.stringify({
      jsonrpc: "2.0",
      method: "account_put_deploy",
      params,
      id: 1,
    });

  // First try: params = { deploy: <deploy> }
  let response = await fetch("/api/casper-rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: makeBody({ deploy: signedDeploy }),
  });

  let data = await response.json();
  console.log("RPC response #1:", data);

  // Fallback: some nodes expect params to be the deploy object directly
  if (
    data?.error?.data &&
    String(data.error.data).includes("unknown field `deploy`")
  ) {
    console.warn("Retrying account_put_deploy with top-level deploy params");
    response = await fetch("/api/casper-rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: makeBody(signedDeploy),
    });
    data = await response.json();
    console.log("RPC response #2:", data);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  if (data.error) {
    throw new Error(`RPC Error: ${data.error.message}`);
  }

  return data.result;
}
