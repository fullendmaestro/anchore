"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { ArrowDownUp, Clock, DollarSign, ArrowRightLeft } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@anchore/ui/components/card";
import { Button } from "@anchore/ui/components/button";
import { Badge } from "@anchore/ui/components/badge";
import { NumericInput } from "./numeric-input";
import { SelectTokenModal } from "./select-token-modal";
import { SelectedTokenButton } from "./selected-token-button";
import { CASPER_TOKENS, CasperToken } from "@/data/casper-tokens";
import { useCasperWallet } from "@/lib/casper-wallet-provider";
import { useCasperContracts } from "@/hooks/use-casper-contracts";
import { toast } from "sonner";

const formSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && num > 0;
    },
    {
      message: "Please enter a valid positive number",
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface Quote {
  sellAmount: string;
  buyAmount: string;
  priceImpact: number;
  fee: string;
  estimatedTime: number;
  rate: number;
}

export function BridgingCard() {
  const { isConnected, publicKey } = useCasperWallet();
  const { swapTokens, isLoading } = useCasperContracts();

  const [sellToken, setSellToken] = useState<CasperToken | null>(
    CASPER_TOKENS[0] ?? null
  );
  const [buyToken, setBuyToken] = useState<CasperToken | null>(
    CASPER_TOKENS[1] ?? null
  );
  const [quote, setQuote] = useState<Quote | null>(null);
  const [modalState, setModalState] = useState<{
    screen: "select-from-token" | "select-to-token";
    isOpen: boolean;
  }>({
    screen: "select-from-token",
    isOpen: false,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: "" },
  });

  // Generate quote when tokens or amount change (mock for now)
  useEffect(() => {
    if (sellToken && buyToken && form.watch("amount")) {
      const amount = form.watch("amount");
      if (parseFloat(amount) > 0) {
        // Mock AMM calculation (x * y = k with 0.3% fee)
        const inputAmount = parseFloat(amount);
        const fee = inputAmount * 0.003; // 0.3%
        const amountAfterFee = inputAmount - fee;
        const outputAmount = amountAfterFee * 0.98; // Mock price impact

        const newQuote: Quote = {
          sellAmount: amount,
          buyAmount: outputAmount.toFixed(4),
          priceImpact: 2.0, // Mock 2% impact
          fee: fee.toFixed(4),
          estimatedTime: 30, // 30 seconds for Casper
          rate: outputAmount / inputAmount,
        };
        setQuote(newQuote);
      }
    } else {
      setQuote(null);
    }
  }, [sellToken, buyToken, form.watch("amount")]);

  const handleSwapTokens = () => {
    const tempToken = sellToken;
    setSellToken(buyToken);
    setBuyToken(tempToken);
    setQuote(null);
  };

  const onSubmit = async (data: FormValues) => {
    if (!isConnected) {
      toast.error("Please connect your Casper wallet");
      return;
    }

    if (!quote || !sellToken || !buyToken) {
      toast.error("Invalid swap parameters");
      return;
    }

    try {
      // Convert to motes (9 decimals)
      const amountInMotes = (parseFloat(data.amount) * 1e9).toString();
      const minAmountOutMotes = (
        parseFloat(quote.buyAmount) *
        0.99 *
        1e9
      ).toString(); // 1% slippage tolerance

      const deployHash = await swapTokens(
        sellToken.hash,
        buyToken.hash,
        amountInMotes,
        minAmountOutMotes
      );

      toast.success(
        <div>
          <p className="font-semibold">Swap initiated!</p>
          <p className="text-xs mt-1">Deploy: {deployHash.slice(0, 16)}...</p>
        </div>
      );

      // Reset form
      form.reset();
      setQuote(null);
    } catch (error: any) {
      toast.error("Swap failed: " + (error.message || "Unknown error"));
      console.error("Swap error:", error);
    }
  };

  return (
    <>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Swap on Casper</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#FF0011]" />
              Casper AMM
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Sell Section */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">You Pay</div>
              <div className="bg-secondary/50 rounded-xl p-4 space-y-4">
                <SelectedTokenButton
                  selectedToken={sellToken}
                  onSelectToken={() =>
                    setModalState({ screen: "select-from-token", isOpen: true })
                  }
                />

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <NumericInput
                      value={form.watch("amount")}
                      onChange={(value) => form.setValue("amount", value)}
                      className="text-3xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 w-full"
                      placeholder="0.00"
                      disabled={!isConnected}
                      decimalScale={4}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!isConnected}
                  >
                    Max
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Balance: 0.0000 {sellToken?.symbol}
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full border-4 border-background"
                onClick={handleSwapTokens}
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>

            {/* Buy Section */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">You Receive</div>
              <div className="bg-muted/50 border border-border/50 rounded-xl p-4 transition-all hover:border-primary/50">
                <SelectedTokenButton
                  selectedToken={buyToken}
                  onSelectToken={() =>
                    setModalState({ screen: "select-to-token", isOpen: true })
                  }
                />

                {quote && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="text-2xl font-bold text-primary">
                      {quote.buyAmount}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Balance: 0.0000 {buyToken?.symbol}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quote Details */}
            {quote && (
              <div className="border-t border-dashed border-border pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Fee (0.3%)
                  </span>
                  <span className="font-medium">
                    {quote.fee} {sellToken?.symbol}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Est. Time
                  </span>
                  <span className="font-medium text-green-500">
                    ~{quote.estimatedTime}s
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">
                    1 {sellToken?.symbol} = {quote.rate.toFixed(4)}{" "}
                    {buyToken?.symbol}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span
                    className={`font-medium ${quote.priceImpact > 3 ? "text-destructive" : "text-green-500"}`}
                  >
                    {quote.priceImpact.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                // !isConnected ||
                // !sellToken ||
                // !buyToken ||
                // !form.formState.isValid ||
                // !quote ||
                isLoading
              }
            >
              {!isConnected
                ? "Connect Casper Wallet"
                : isLoading
                  ? "Swapping..."
                  : "Swap Tokens"}
            </Button>

            {!isConnected && (
              <div className="text-center text-xs text-muted-foreground">
                Connect your Casper wallet to start swapping
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <SelectTokenModal
        modalState={modalState}
        selectedToken={
          modalState.screen === "select-from-token" ? sellToken : buyToken
        }
        onSelectToken={(token) => {
          if (modalState.screen === "select-from-token") {
            setSellToken(token);
            // Auto-select the other token if same
            if (buyToken?.hash === token.hash) {
              const otherToken = CASPER_TOKENS.find(
                (t) => t.hash !== token.hash
              );
              setBuyToken(otherToken || null);
            }
          } else {
            setBuyToken(token);
            // Auto-select the other token if same
            if (sellToken?.hash === token.hash) {
              const otherToken = CASPER_TOKENS.find(
                (t) => t.hash !== token.hash
              );
              setSellToken(otherToken || null);
            }
          }
        }}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </>
  );
}
