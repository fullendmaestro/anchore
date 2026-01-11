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
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  Loader2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(45,212,191,0.12),transparent_25%)]" />

      <div className="container relative mx-auto max-w-6xl px-4 py-10 lg:py-14">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm">
          <Link href="/bridge">
            <Button
              variant="ghost"
              size="sm"
              className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 hover:-translate-y-[1px] hover:border-primary/50 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              <span className="font-medium">Back to bridge</span>
            </Button>
          </Link>
          <span className="hidden text-muted-foreground sm:inline">
            Need assets on EVM? Swap over the bridge after minting here.
          </span>
        </div>

        <div className="mb-8 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                Anchore faucet
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-foreground">
                Top up Casper-side liquidity fast
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                Mint testnet tokens to simulate cross-chain swaps, AMM deposits,
                and bridge exits without waiting on centralized taps.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Casper testnet
                </span>
                <span className="rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                  Contract-level mint, no queues
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {selectedToken
                    ? `${selectedToken.symbol} ready`
                    : "Pick a token"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isConnected
                    ? "Wallet connected"
                    : "Connect Casper wallet to start"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border border-border/70 bg-card/60 shadow-lg backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-2xl">Request test tokens</CardTitle>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                  Casper ready
                </span>
              </div>
              <CardDescription className="text-base">
                Choose a Casper-side asset and mint the amount you need for
                bridge flows and AMM testing.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Network</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="flex items-center justify-between rounded-xl border-border bg-background/50 px-4 py-3 text-left"
                    disabled
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Image
                        src="/icons/networks/ethereum.svg"
                        alt="Ethereum"
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      Sepolia ETH
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Disabled
                    </span>
                  </Button>

                  <Button className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-left hover:bg-primary/20">
                    <span className="flex items-center gap-2">
                      <Image
                        src="/icons/networks/casper.png"
                        alt="Casper"
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      Casper Testnet
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      Active
                    </span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select token</Label>
                <Select
                  value={selectedToken?.symbol || ""}
                  onValueChange={(symbol) => {
                    const token = casperTokens.find((t) => t.symbol === symbol);
                    setSelectedToken(token || null);
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-border bg-background/70">
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
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-foreground">
                              {token.symbol}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {token.name}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Wallet address
                  </Label>
                  <Input
                    value={publicKey || ""}
                    disabled
                    placeholder="Connect your wallet"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isConnected
                      ? "Casper wallet detected"
                      : "Please connect your Casper wallet to continue."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Amount</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="1000"
                    />
                    <div className="flex items-center gap-2">
                      {["250", "500", "1000"].map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setAmount(preset)}
                        >
                          {preset}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {selectedToken && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Request amount</span>
                      <span className="font-medium">
                        {amount} {selectedToken.symbol}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleRequest}
                disabled={
                  !isConnected || !selectedToken || isLoading || !amount
                }
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
            </CardContent>
          </Card>

          <div className="space-y-4">
            {(faucetResult.data || faucetResult.error) && (
              <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                {faucetResult.data && (
                  <div className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-green-500">
                        Tokens requested successfully
                      </p>
                      <p className="break-all text-muted-foreground">
                        Deploy Hash: {faucetResult.data.deployHash}
                      </p>
                      <a
                        href={`https://testnet.cspr.live/deploy/${faucetResult.data.deployHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-semibold text-blue-500 hover:underline"
                      >
                        View on CSPR.live →
                      </a>
                    </div>
                  </div>
                )}

                {faucetResult.error && (
                  <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-red-500">
                        Request failed
                      </p>
                      <p className="text-muted-foreground">
                        Please try again or check your wallet connection.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    How the faucet mints
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Purpose-built for Anchore bridge testing with Casper-native
                    tokens.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>
                    Wallet signature authorizes the mint on Casper contracts.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>
                    Expect ~2.5 CSPR gas burn per request; native assets are
                    excluded.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>
                    Tokens arrive directly in your connected Casper address.
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                <Info className="h-4 w-4 text-primary" />
                <p>
                  Use these test assets to simulate cross-chain swaps and
                  liquidity adds before mainnet launch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
