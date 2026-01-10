import { NextRequest, NextResponse } from "next/server";

// Configure runtime for serverless
export const runtime = "edge"; // or 'nodejs'

const CASPER_RPC_URL =
  process.env.NEXT_PUBLIC_CASPER_NODE_URL ||
  "https://node.testnet.casper.network/rpc";

export async function POST(request: NextRequest) {
  try {
    // Parse incoming JSON-RPC request
    const body = await request.json();

    // Forward to Casper RPC node
    const response = await fetch(CASPER_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Return response with CORS headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "RPC request failed",
        message: error?.message || "Unknown error",
      },
      { status: 502 }
    );
  }
}

// Handle OPTIONS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
