"use client";

import { useState } from "react";
import { Button } from "@anchore/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@anchore/ui/components/card";
import { Label } from "@anchore/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@anchore/ui/components/select";
import { Input } from "@anchore/ui/components/input";
import { TOKENS, CASPER_CHAIN_ID } from "@/data";
import { TokenBase } from "@/data/types";
import { useCasperWallet } from "@/lib/casper-wallet-provider";
import { useFaucet } from "@/hooks/faucet/use-faucet";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

export default function FaucetPage() {
  const { publicKey, isConnected } = useCasperWallet();
  const { requestTokens, isLoading, faucetResult } = useFaucet();

  const [selectedToken, setSelectedToken] = useState<TokenBase | null>(null);
  const [amount, setAmount] = useState("1000");

  // Filter only Casper tokens
  const casperTokens = TOKENS.filter(
    (token) => token.chainId === CASPER_CHAIN_ID
  );

  const handleRequest = async () => {
    if (!selectedToken) return;

    // Convert to smallest unit based on decimals
    const toSmallestUnit = (amt: string, decimals: number): string => {
      const [wholeRaw, fracRaw = ""] = amt.split(".");
      const whole = wholeRaw?.replace(/\D/g, "") || "0";
      const frac = fracRaw.replace(/\D/g, "");
      const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
      const combined = whole + fracPadded;
      // Remove leading zeros while preserving at least one digit
      const normalized = combined.replace(/^0+(?=\d)/, "");
      return normalized.length ? normalized : "0";
    };

    const amountInSmallestUnit = toSmallestUnit(amount, selectedToken.decimals);
    await requestTokens(selectedToken, amountInSmallestUnit);
  };

  return (
    <main
      className="container mx-auto p-4 overflow-y-auto"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Get Testnet Tokens</CardTitle>
            <CardDescription>
              Request ERC-20 and CEP-18 test tokens for the cross-chain bridge.
              Native assets (ETH, CSPR) are excluded from the faucet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Network */}
            <div className="space-y-2">
              <Label>Select Network</Label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" disabled>
                  <Image
                    src="/icons/networks/ethereum.svg"
                    alt="Ethereum"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Sepolia ETH
                </Button>
                <Button variant="default" className="flex-1">
                  <Image
                    src="/icons/networks/casper.png"
                    alt="Casper"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Casper Testnet
                </Button>
              </div>
            </div>

            {/* Select Token */}
            <div className="space-y-2">
              <Label>Select Token</Label>
              <Select
                value={selectedToken?.symbol || ""}
                onValueChange={(symbol) => {
                  const token = casperTokens.find((t) => t.symbol === symbol);
                  setSelectedToken(token || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a token to request" />
                </SelectTrigger>
                <SelectContent>
                  {casperTokens.map((token) => (
                    <SelectItem key={token.address} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={token.logoURI}
                          alt={token.symbol}
                          width={20}
                          height={20}
                        />
                        <span>
                          {token.symbol} - {token.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input
                value={publicKey || ""}
                disabled
                placeholder="Connect your wallet"
                className="font-mono text-sm"
              />
              {!isConnected && (
                <p className="text-sm text-muted-foreground">
                  Please connect your Casper wallet to continue
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
              />
              {selectedToken && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>REQUEST AMOUNT:</span>
                  <span className="font-medium">
                    {amount} {selectedToken.symbol}
                  </span>
                </div>
              )}
            </div>

            {/* Request Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleRequest}
              disabled={!isConnected || !selectedToken || isLoading || !amount}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Request Tokens →</>
              )}
            </Button>

            {/* Result Status */}
            {faucetResult.data && (
              <div className="flex items-start gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-500">
                    Tokens Requested Successfully
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 break-all">
                    Deploy Hash: {faucetResult.data.deployHash}
                  </p>
                  <a
                    href={`https://testnet.cspr.live/deploy/${faucetResult.data.deployHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline mt-1 inline-block"
                  >
                    View on CSPR.live →
                  </a>
                </div>
              </div>
            )}

            {faucetResult.error && (
              <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-500">Request Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please try again or check your wallet connection.
                  </p>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  This faucet allows you to mint testnet tokens by calling the{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">mint</code>{" "}
                  function on the token contract. Each request will:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Require wallet signature approval</li>
                  <li>Cost ~2.5 CSPR in gas fees</li>
                  <li>Mint tokens directly to your address</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
