"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "@anchore/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@anchore/ui/components/sheet";
import { X, Wallet, LogOut, AlertCircle } from "lucide-react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { useCasperWallet } from "@/lib/casper-wallet-provider";
import { toast } from "sonner";
import { cn } from "@anchore/ui/lib/utils";

interface WalletSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConnectedWalletCard = ({
  address,
  networkName,
  iconSrc,
  onDisconnect,
  isError = false,
  className,
}: {
  address: string | undefined | null;
  networkName: string;
  iconSrc: string;
  onDisconnect: () => void;
  isError?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center justify-between p-3 rounded-xl border bg-secondary/20 transition-colors",
      isError ? "border-red-500/20 bg-red-500/5" : "border-border",
      className
    )}
  >
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="relative flex-shrink-0 w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border/50">
        {isError ? (
          <AlertCircle className="w-5 h-5 text-red-500" />
        ) : (
          <Image
            src={iconSrc}
            alt={networkName}
            width={24}
            height={24}
            className="object-contain"
          />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold truncate">
          {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "..."}
        </span>
        <span
          className={cn(
            "text-xs truncate",
            isError ? "text-red-400" : "text-muted-foreground"
          )}
        >
          {networkName}
        </span>
      </div>
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={onDisconnect}
      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
    >
      <LogOut className="h-4 w-4" />
    </Button>
  </div>
);

export function WalletSidebar({ open, onOpenChange }: WalletSidebarProps) {
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { connect: evmConnect, connectors } = useConnect();
  const { disconnect: evmDisconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const {
    publicKey: casperPublicKey,
    isConnected: casperConnected,
    connect: casperConnect,
    disconnect: casperDisconnect,
  } = useCasperWallet();

  const handleEvmConnect = useCallback(() => {
    const injectedConnector = connectors.find((c) => c.id === "injected");
    if (injectedConnector) {
      evmConnect(
        { connector: injectedConnector },
        {
          onSuccess: () => {
            if (chainId !== sepolia.id) {
              switchChain({ chainId: sepolia.id });
            }
          },
        }
      );
    }
  }, [evmConnect, connectors, chainId, switchChain]);

  const handleCasperConnect = useCallback(async () => {
    try {
      await casperConnect();
    } catch (error: any) {
      toast.error("Failed to connect Casper wallet: " + error.message);
    }
  }, [casperConnect]);

  const isUnsupportedEvm = evmConnected && chainId !== sepolia.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[400px] border-l-border"
      >
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Account</SheetTitle>
            {/* The X close button is usually handled by SheetContent, but keeping custom if needed */}
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          {/* STATE 1: ONLY CASPER CONNECTED (Show Casper Card + Connect EVM Button) */}
          {!evmConnected && casperConnected && (
            <>
              <ConnectedWalletCard
                address={casperPublicKey ?? undefined}
                networkName="Casper Testnet"
                iconSrc="/icons/networks/Casper.png"
                onDisconnect={casperDisconnect}
              />
              <Button
                onClick={handleEvmConnect}
                variant="outline"
                className="w-full h-14 text-base font-medium rounded-xl border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
              >
                Connect EVM Wallet
              </Button>
            </>
          )}

          {/* STATE 2: ONLY EVM CONNECTED (Show EVM Card + Connect Casper Button) */}
          {!casperConnected && evmConnected && (
            <>
              <ConnectedWalletCard
                address={evmAddress}
                networkName={
                  isUnsupportedEvm ? "Unsupported Network" : "Sepolia"
                }
                iconSrc="/icons/networks/ethereum.svg"
                onDisconnect={() => evmDisconnect()}
                isError={isUnsupportedEvm}
              />
              <Button
                onClick={handleCasperConnect}
                variant="outline"
                className="w-full h-14 text-base font-medium rounded-xl border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
              >
                Connect Casper Wallet
              </Button>
            </>
          )}

          {/* STATE 3: BOTH CONNECTED (Show Grid View) */}
          {evmConnected && casperConnected && (
            <div className="grid grid-cols-2 gap-3">
              <ConnectedWalletCard
                address={evmAddress}
                networkName={isUnsupportedEvm ? "Unsupported" : "Sepolia"}
                iconSrc="/icons/networks/ethereum.svg"
                onDisconnect={() => evmDisconnect()}
                isError={isUnsupportedEvm}
                className="col-span-1 px-2"
              />
              <ConnectedWalletCard
                address={casperPublicKey ?? undefined}
                networkName="Casper"
                iconSrc="/icons/networks/Casper.png"
                onDisconnect={casperDisconnect}
                className="col-span-1 px-2"
              />
            </div>
          )}

          {/* STATE 4: NEITHER CONNECTED */}
          {!evmConnected && !casperConnected && (
            <div className="space-y-3">
              <Button
                onClick={handleEvmConnect}
                variant="outline"
                className="w-full h-12 justify-start px-4 text-base font-medium border-border hover:bg-secondary/50"
              >
                <div className="w-8 h-8 mr-3 rounded-full bg-secondary flex items-center justify-center">
                  <Image
                    src="/icons/networks/ethereum.svg"
                    width={16}
                    height={16}
                    alt="ETH"
                  />
                </div>
                Connect EVM Wallet
              </Button>
              <Button
                onClick={handleCasperConnect}
                variant="outline"
                className="w-full h-12 justify-start px-4 text-base font-medium border-border hover:bg-secondary/50"
              >
                <div className="w-8 h-8 mr-3 rounded-full bg-secondary flex items-center justify-center">
                  <Image
                    src="/icons/networks/Casper.png"
                    width={16}
                    height={16}
                    alt="CSPR"
                  />
                </div>
                Connect Casper Wallet
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
