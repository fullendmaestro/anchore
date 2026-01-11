"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@anchore/ui/components/dialog";
import { Button } from "@anchore/ui/components/button";
import { TokenBase } from "@/data/types";
import {
  useSwapWithApproval,
  SwapStep,
} from "../_hooks/use-swap-with-approval";
import Image from "next/image";
import { Loader2, CheckCircle2, ExternalLink, ArrowRight } from "lucide-react";

interface SwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellToken: TokenBase | null;
  buyToken: TokenBase | null;
  sellAmount: string;
  buyAmount: string;
  poolAddress: string;
  quote: {
    priceImpact: number;
    fee: string;
    rate: number;
  } | null;
}

enum ModalScreen {
  REVIEW = "review",
  CONFIRM = "confirm",
}

export function SwapModal({
  open,
  onOpenChange,
  sellToken,
  buyToken,
  sellAmount,
  buyAmount,
  poolAddress,
  quote,
}: SwapModalProps) {
  const [screen, setScreen] = useState<ModalScreen>(ModalScreen.REVIEW);
  const { executeSwap, state, isLoading, reset } = useSwapWithApproval();

  const handleClose = () => {
    setScreen(ModalScreen.REVIEW);
    reset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!sellToken || !buyToken) return;

    // Convert to smallest units
    const toSmallestUnit = (amt: string, decimals: number): string => {
      const [whole = "0", frac = ""] = amt.split(".");
      const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
      const combined = whole.replace(/\D/g, "") + fracPadded;
      return combined.replace(/^0+(?=\d)/, "") || "0";
    };

    const sellAmountSmallest = toSmallestUnit(sellAmount, sellToken.decimals);

    setScreen(ModalScreen.CONFIRM);
    await executeSwap({
      sellToken,
      buyToken,
      amountIn: sellAmountSmallest,
      poolAddress,
    });
  };

  if (!sellToken || !buyToken) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[85vh] border-border-dark">
        {/* Review Screen */}
        {screen === ModalScreen.REVIEW && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Review Swap
              </h2>
              <p className="text-slate-400 text-sm">
                Please review your swap details before confirming
              </p>
            </div>

            {/* Swap Summary */}
            <div className="space-y-4">
              {/* Sell Token */}
              <div className="p-4 rounded-lg bg-background-dark border border-border-dark">
                <div className="text-xs text-slate-400 mb-2">You sell</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={sellToken.logoURI}
                      alt={sellToken.symbol}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <div className="text-white font-bold text-lg">
                        {sellAmount} {sellToken.symbol}
                      </div>
                      <div className="text-xs text-slate-400">
                        {sellToken.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="p-2 rounded-full bg-primary/10">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Buy Token */}
              <div className="p-4 rounded-lg bg-background-dark border border-border-dark">
                <div className="text-xs text-slate-400 mb-2">You receive</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={buyToken.logoURI}
                      alt={buyToken.symbol}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <div className="text-white font-bold text-lg">
                        {buyAmount} {buyToken.symbol}
                      </div>
                      <div className="text-xs text-slate-400">
                        {buyToken.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Details */}
            {quote && (
              <div className="p-4 rounded-lg bg-background-dark border border-border-dark space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Rate</span>
                  <span className="text-white font-medium">
                    1 {sellToken.symbol} = {quote.rate.toFixed(6)}{" "}
                    {buyToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Fee (0.3%)</span>
                  <span className="text-white font-medium">
                    {quote.fee} {sellToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Price Impact</span>
                  <span
                    className={`font-medium ${
                      quote.priceImpact > 5
                        ? "text-red-400"
                        : quote.priceImpact > 2
                          ? "text-yellow-400"
                          : "text-emerald-400"
                    }`}
                  >
                    {quote.priceImpact.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            {/* Transaction Steps */}
            <div className="p-4 rounded-lg bg-background-dark border border-border-dark">
              <div className="text-sm text-slate-300 space-y-2">
                <p className="font-medium text-white mb-3">
                  Transaction steps:
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span>Approve {sellToken.symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span>Execute swap</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-border-dark hover:bg-border-dark"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-primary hover:bg-primary/90 text-background-dark font-bold"
              >
                Confirm Swap
              </Button>
            </div>
          </div>
        )}

        {/* Confirm/Progress Screen */}
        {screen === ModalScreen.CONFIRM && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {state.step === SwapStep.COMPLETE
                  ? "Swap Successful!"
                  : "Swapping Tokens"}
              </h2>
              <p className="text-slate-400 text-sm">
                {state.step === SwapStep.COMPLETE
                  ? "Your swap has been executed successfully"
                  : "Please confirm all transactions in your wallet"}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              {/* Step 1: Approve Token */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background-dark border border-border-dark">
                <div>
                  {state.step === SwapStep.APPROVING ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : state.step === SwapStep.SWAPPING ||
                    state.step === SwapStep.COMPLETE ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border-dark" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">
                    Approve {sellToken.symbol}
                  </div>
                  <div className="text-xs text-slate-400">
                    Allow pool to spend your tokens
                  </div>
                </div>
              </div>

              {/* Step 2: Execute Swap */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background-dark border border-border-dark">
                <div>
                  {state.step === SwapStep.SWAPPING ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : state.step === SwapStep.COMPLETE ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border-dark" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Execute Swap</div>
                  <div className="text-xs text-slate-400">
                    Swap {sellToken.symbol} for {buyToken.symbol}
                  </div>
                </div>
              </div>
            </div>

            {/* Success State */}
            {state.step === SwapStep.COMPLETE && state.deployHash && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-sm space-y-2">
                  <p className="text-emerald-400 font-medium">
                    ✓ Swap executed successfully!
                  </p>
                  <a
                    href={`https://testnet.cspr.live/deploy/${state.deployHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    View on Explorer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Error State */}
            {state.step === SwapStep.ERROR && state.error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{state.error}</p>
              </div>
            )}

            <Button
              onClick={handleClose}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold"
            >
              {state.step === SwapStep.COMPLETE ? "Close" : "Cancel"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
