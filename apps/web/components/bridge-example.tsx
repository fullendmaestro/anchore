"use client";

import { useState } from "react";
import { Button } from "@anchore/ui/components/button";
import { Input } from "@anchore/ui/components/input";
import { Label } from "@anchore/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@anchore/ui/components/card";
import { useWalletStatus } from "@/hooks/use-wallet-status";
import { useEVMContracts } from "@/hooks/use-evm-contracts";
import { useCasperContracts } from "@/hooks/use-casper-contracts";
import { toast } from "sonner";
import { ArrowDown, ArrowUpDown } from "lucide-react";

type BridgeDirection = "evm-to-casper" | "casper-to-evm";

/**
 * Example component showing how to use wallet connections and contract interactions
 * This demonstrates the pattern but doesn't implement the full UI
 */
export function BridgeExample() {
  const walletStatus = useWalletStatus();
  const evmContracts = useEVMContracts();
  const casperContracts = useCasperContracts();

  const [direction, setDirection] = useState<BridgeDirection>("evm-to-casper");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");

  const toggleDirection = () => {
    setDirection((prev) =>
      prev === "evm-to-casper" ? "casper-to-evm" : "evm-to-casper"
    );
  };

  const handleBridge = async () => {
    if (!amount || !tokenAddress) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (direction === "evm-to-casper") {
        if (!walletStatus.evm.connected || !walletStatus.casper.publicKey) {
          toast.error("Please connect both wallets");
          return;
        }

        await evmContracts.bridgeToCasper(
          tokenAddress as `0x${string}`,
          amount,
          walletStatus.casper.publicKey,
          false // Set to true if you want to swap on arrival
        );

        toast.success("Bridge initiated! Tokens will arrive on Casper soon.");
      } else {
        if (!walletStatus.casper.connected || !walletStatus.evm.address) {
          toast.error("Please connect both wallets");
          return;
        }

        const deployHash = await casperContracts.bridgeToEVM(
          tokenAddress.replace("0x", "hash-"), // Convert format
          amount,
          walletStatus.evm.address
        );

        toast.success(`Deploy submitted: ${deployHash}`);
      }

      // Reset form
      setAmount("");
      setTokenAddress("");
    } catch (error: any) {
      toast.error(error.message || "Bridge failed");
      console.error(error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cross-Chain Bridge Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Direction Selector */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="text-center flex-1">
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-semibold">
              {direction === "evm-to-casper" ? "Ethereum" : "Casper"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDirection}
            className="mx-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <div className="text-center flex-1">
            <p className="text-sm text-muted-foreground">To</p>
            <p className="font-semibold">
              {direction === "evm-to-casper" ? "Casper" : "Ethereum"}
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span>Ethereum:</span>
            <span
              className={
                walletStatus.evm.connected ? "text-green-500" : "text-red-500"
              }
            >
              {walletStatus.evm.connected ? "Connected" : "Not connected"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Casper:</span>
            <span
              className={
                walletStatus.casper.connected
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {walletStatus.casper.connected ? "Connected" : "Not connected"}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-2">
          <Label>Token Address</Label>
          <Input
            placeholder={direction === "evm-to-casper" ? "0x..." : "hash-..."}
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Bridge Button */}
        <Button
          className="w-full"
          onClick={handleBridge}
          disabled={
            !walletStatus.bothConnected ||
            evmContracts.isPending ||
            casperContracts.isLoading
          }
        >
          {evmContracts.isPending || casperContracts.isLoading
            ? "Bridging..."
            : "Bridge Tokens"}
        </Button>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center">
          This is an example component demonstrating wallet integration. Replace
          with your actual bridge UI.
        </p>
      </CardContent>
    </Card>
  );
}
