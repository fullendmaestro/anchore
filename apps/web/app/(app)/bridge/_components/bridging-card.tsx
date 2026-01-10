"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@anchore/ui/components/card";
import { Button } from "@anchore/ui/components/button";
import { NumericInput } from "./numeric-input";
import { SelectTokenModal } from "./select-token-modal";
import { SelectedTokenButton } from "./selected-token-button";
import { TOKENS } from "@/data";
import { TokenBase } from "@/data/types";

import { useCasperWallet } from "@/lib/casper-wallet-provider";
import { useSwap } from "@/hooks/swap/use-swap";
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
  const { executeSwap, swapResult, isLoading, resetSwap } = useSwap();

  const [sellToken, setSellToken] = useState<TokenBase | null>(
    TOKENS[0] ?? null
  );
  const [buyToken, setBuyToken] = useState<TokenBase | null>(TOKENS[1] ?? null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [modalState, setModalState] = useState<{
    screen: "select-sell-token" | "select-buy-token";
    isOpen: boolean;
  }>({
    screen: "select-sell-token",
    isOpen: false,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: "" },
  });

  // Compute derived values
  const isCrossChain = sellToken?.chainId !== buyToken?.chainId;
  const sellBalance = "0.00"; // TODO: Fetch from wallet

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

    await executeSwap({
      sellToken,
      buyToken,
      amountIn: data.amount,
      expectedAmountOut: quote.buyAmount,
      slippageBps: 100,
    });
  };

  // Reset form after successful swap
  useEffect(() => {
    if (swapResult.data) {
      form.reset();
      setQuote(null);
      // Auto-reset after showing success
      const timer = setTimeout(() => resetSwap(), 3000);
      return () => clearTimeout(timer);
    }
  }, [swapResult.data, form, resetSwap]);

  return (
    <>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Swap on Casper</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Sell Section */}
            <div className="space-y-2">
              <div className="bg-secondary/50 rounded-xl p-4 space-y-4">
                <SelectedTokenButton
                  selectedToken={sellToken}
                  onSelectToken={() =>
                    setModalState({ screen: "select-sell-token", isOpen: true })
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
                    onClick={() => form.setValue("amount", sellBalance)}
                  >
                    Max
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    ≈ $
                    {(
                      parseFloat(form.watch("amount") || "0") *
                      (sellToken ? 1 : 0)
                    ).toFixed(2)}{" "}
                    USD
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Balance: {sellBalance}
                  </span>
                </div>
              </div>
            </div>

            {/* Buy Section */}
            <div className="space-y-2">
              <div className="bg-muted/50 border border-border/50 rounded-xl p-4 transition-all hover:border-primary/50">
                <SelectedTokenButton
                  selectedToken={buyToken}
                  onSelectToken={() =>
                    setModalState({ screen: "select-buy-token", isOpen: true })
                  }
                />

                {quote && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="text-2xl font-bold text-primary">
                      {quote.buyAmount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ $
                      {(
                        parseFloat(quote.buyAmount) * (buyToken ? 1 : 0)
                      ).toFixed(2)}{" "}
                      USD
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                !sellToken || !buyToken || !quote || isLoading
                // || !form.formState.isValid
              }
            >
              {isLoading
                ? "Processing swap..."
                : isCrossChain
                  ? "Bridge Asset"
                  : "Swap Asset"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SelectTokenModal
        modalState={modalState}
        selectedToken={
          modalState.screen === "select-sell-token" ? sellToken : buyToken
        }
        onSelectToken={(token) => {
          if (modalState.screen === "select-sell-token") {
            setSellToken(token);
            // Auto-select the other token if same
            if (buyToken?.address === token.address) {
              const otherToken = TOKENS.find(
                (t) => t.address !== token.address
              );
              setBuyToken(otherToken || null);
            }
          } else {
            setBuyToken(token);
            // Auto-select the other token if same
            if (sellToken?.address === token.address) {
              const otherToken = TOKENS.find(
                (t) => t.address !== token.address
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
