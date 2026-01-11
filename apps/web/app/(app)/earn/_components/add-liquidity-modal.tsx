"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@anchore/ui/components/dialog";
import { Button } from "@anchore/ui/components/button";
import { Input } from "@anchore/ui/components/input";
import { Label } from "@anchore/ui/components/label";
import { LiquidityPool } from "@/data/pools";
import { TOKENS } from "@/data";
import {
  useAddLiquidity,
  AddLiquidityStep,
} from "@/hooks/liquidity/use-add-liquidity";
import Image from "next/image";
import { Loader2, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";

interface AddLiquidityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pool: LiquidityPool | null;
}

enum ModalScreen {
  AMOUNTS = "amounts",
  REVIEW = "review",
  CONFIRM = "confirm",
}

export function AddLiquidityModal({
  open,
  onOpenChange,
  pool,
}: AddLiquidityModalProps) {
  const [screen, setScreen] = useState<ModalScreen>(ModalScreen.AMOUNTS);
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const { addLiquidity, state, isLoading, reset } = useAddLiquidity();

  const token0 = TOKENS.find((t) => t.address === pool?.token0Address);
  const token1 = TOKENS.find((t) => t.address === pool?.token1Address);

  const handleClose = () => {
    setScreen(ModalScreen.AMOUNTS);
    setAmount0("");
    setAmount1("");
    reset();
    onOpenChange(false);
  };

  const handleReview = () => {
    if (!amount0 || !amount1) return;
    setScreen(ModalScreen.REVIEW);
  };

  const handleConfirm = async () => {
    if (!pool || !token0 || !token1) return;

    // Convert to smallest units
    const toSmallestUnit = (amt: string, decimals: number): string => {
      const [whole = "0", frac = ""] = amt.split(".");
      const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
      const combined = whole.replace(/\D/g, "") + fracPadded;
      return combined.replace(/^0+(?=\d)/, "") || "0";
    };

    const amount0Smallest = toSmallestUnit(amount0, token0.decimals);
    const amount1Smallest = toSmallestUnit(amount1, token1.decimals);

    setScreen(ModalScreen.CONFIRM);
    await addLiquidity(pool, amount0Smallest, amount1Smallest);
  };

  if (!pool) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-surface-dark border-border-dark">
        {/* Amounts Screen */}
        {screen === ModalScreen.AMOUNTS && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Add Liquidity
              </h2>
              <p className="text-slate-400 text-sm">
                Add liquidity to {pool.token0Symbol}/{pool.token1Symbol} pool
                and earn 0.3% trading fees
              </p>
            </div>

            {/* Pool Info */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-background-dark border border-border-dark">
              <div className="flex -space-x-2">
                <Image
                  src={pool.token0Logo}
                  alt={pool.token0Symbol}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-surface-dark"
                />
                <Image
                  src={pool.token1Logo}
                  alt={pool.token1Symbol}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-surface-dark"
                />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold">
                  {pool.token0Symbol}/{pool.token1Symbol}
                </div>
                <div className="text-xs text-slate-400">
                  APR: {pool.apr} • TVL: {pool.totalValueLocked}
                </div>
              </div>
            </div>

            {/* Amount Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">
                  {pool.token0Symbol} Amount
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount0}
                    onChange={(e) => setAmount0(e.target.value)}
                    className="flex-1 bg-background-dark border-border-dark text-white"
                  />
                  <div className="flex items-center gap-2 px-3 bg-background-dark border border-border-dark rounded-lg">
                    <Image
                      src={pool.token0Logo}
                      alt={pool.token0Symbol}
                      width={20}
                      height={20}
                    />
                    <span className="text-white font-medium">
                      {pool.token0Symbol}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">
                  {pool.token1Symbol} Amount
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount1}
                    onChange={(e) => setAmount1(e.target.value)}
                    className="flex-1 bg-background-dark border-border-dark text-white"
                  />
                  <div className="flex items-center gap-2 px-3 bg-background-dark border border-border-dark rounded-lg">
                    <Image
                      src={pool.token1Logo}
                      alt={pool.token1Symbol}
                      width={20}
                      height={20}
                    />
                    <span className="text-white font-medium">
                      {pool.token1Symbol}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="text-sm text-slate-300 space-y-1">
                <p className="font-medium text-primary">💡 Important</p>
                <p>
                  You&apos;ll need to approve both tokens and then add liquidity
                  (3 transactions total).
                </p>
              </div>
            </div>

            <Button
              onClick={handleReview}
              disabled={!amount0 || !amount1}
              className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold"
            >
              Review
            </Button>
          </div>
        )}

        {/* Review Screen */}
        {screen === ModalScreen.REVIEW && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Review Liquidity
              </h2>
              <p className="text-slate-400 text-sm">
                Please review your liquidity details before confirming
              </p>
            </div>

            {/* Summary Card */}
            <div className="p-4 rounded-lg bg-background-dark border border-border-dark space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">You&apos;re adding</span>
                <div className="text-right">
                  <div className="text-white font-bold">
                    {amount0} {pool.token0Symbol}
                  </div>
                  <div className="text-white font-bold">
                    {amount1} {pool.token1Symbol}
                  </div>
                </div>
              </div>
              <div className="border-t border-border-dark pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pool</span>
                  <span className="text-white font-medium">
                    {pool.token0Symbol}/{pool.token1Symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-400">Pool APR</span>
                  <span className="text-primary font-bold">{pool.apr}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-400">Estimated share</span>
                  <span className="text-white">~0.01%</span>
                </div>
              </div>
            </div>

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
                  <span>Approve {pool.token0Symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span>Approve {pool.token1Symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span>Add liquidity to pool</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setScreen(ModalScreen.AMOUNTS)}
                variant="outline"
                className="flex-1 border-border-dark hover:bg-border-dark"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-primary hover:bg-primary/90 text-background-dark font-bold"
              >
                Confirm
              </Button>
            </div>
          </div>
        )}

        {/* Confirm/Progress Screen */}
        {screen === ModalScreen.CONFIRM && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {state.step === AddLiquidityStep.COMPLETE
                  ? "Success!"
                  : "Adding Liquidity"}
              </h2>
              <p className="text-slate-400 text-sm">
                {state.step === AddLiquidityStep.COMPLETE
                  ? "Your liquidity has been added successfully"
                  : "Please confirm all transactions in your wallet"}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              {/* Step 1: Approve Token0 */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background-dark border border-border-dark">
                <div>
                  {state.step === AddLiquidityStep.APPROVING_TOKEN0 ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : state.step === AddLiquidityStep.APPROVING_TOKEN1 ||
                    state.step === AddLiquidityStep.ADDING_LIQUIDITY ||
                    state.step === AddLiquidityStep.COMPLETE ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border-dark" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">
                    Approve {pool.token0Symbol}
                  </div>
                  <div className="text-xs text-slate-400">
                    Allow pool to spend your tokens
                  </div>
                </div>
              </div>

              {/* Step 2: Approve Token1 */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background-dark border border-border-dark">
                <div>
                  {state.step === AddLiquidityStep.APPROVING_TOKEN1 ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : state.step === AddLiquidityStep.ADDING_LIQUIDITY ||
                    state.step === AddLiquidityStep.COMPLETE ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border-dark" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">
                    Approve {pool.token1Symbol}
                  </div>
                  <div className="text-xs text-slate-400">
                    Allow pool to spend your tokens
                  </div>
                </div>
              </div>

              {/* Step 3: Add Liquidity */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background-dark border border-border-dark">
                <div>
                  {state.step === AddLiquidityStep.ADDING_LIQUIDITY ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : state.step === AddLiquidityStep.COMPLETE ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border-dark" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Add Liquidity</div>
                  <div className="text-xs text-slate-400">
                    Deposit tokens into the pool
                  </div>
                </div>
              </div>
            </div>

            {/* Success State */}
            {state.step === AddLiquidityStep.COMPLETE && state.deployHash && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-sm space-y-2">
                  <p className="text-emerald-400 font-medium">
                    ✓ Liquidity added successfully!
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
            {state.step === AddLiquidityStep.ERROR && state.error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{state.error}</p>
              </div>
            )}

            <Button
              onClick={handleClose}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold"
            >
              {state.step === AddLiquidityStep.COMPLETE ? "Close" : "Cancel"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
