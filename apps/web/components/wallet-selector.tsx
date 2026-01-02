"use client";

import { Copy, LogOut, ExternalLink, Check } from "lucide-react";
import { useCallback, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@anchore/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@anchore/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@anchore/ui/components/dropdown-menu";
import { useCasperWallet } from "@/lib/casper-wallet-provider";
import Image from "next/image";
import { toast } from "sonner";

interface Props {
  className?: string;
}

export function WalletSelector({ className }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isConnected: evmConnected, address: evmAddress } = useAccount();
  const { isConnected: casperConnected, publicKey: casperPublicKey } =
    useCasperWallet();

  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  // Show connected state if at least one wallet is connected
  if (evmConnected || casperConnected) {
    return (
      <ConnectedWallets
        className={className}
        evmConnected={evmConnected}
        evmAddress={evmAddress}
        casperConnected={casperConnected}
        casperPublicKey={casperPublicKey}
      />
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className={className}>Connect Wallets</Button>
      </DialogTrigger>
      <ConnectWalletDialog close={closeDialog} />
    </Dialog>
  );
}

interface ConnectWalletDialogProps {
  close: () => void;
}

function ConnectWalletDialog({ close }: ConnectWalletDialogProps) {
  const { isConnected: evmConnected } = useAccount();
  const { isConnected: casperConnected, connect: casperConnect } =
    useCasperWallet();

  const handleCasperConnect = async () => {
    try {
      await casperConnect();
      toast.success("Casper wallet connected!");
    } catch (error) {
      toast.error("Failed to connect Casper wallet");
      console.error(error);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl">
          Connect Wallets
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Ethereum Network */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#627EEA]">
              <Image
                src="/icons/ethereum.svg"
                alt="Ethereum"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </div>
            <div>
              <h3 className="font-semibold">Ethereum Network</h3>
              <p className="text-sm text-muted-foreground">
                {evmConnected ? "Connected" : "Disconnected"}
              </p>
            </div>
          </div>

          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const connected = mounted && account && chain;

              return (
                <div>
                  {(() => {
                    if (!connected) {
                      return (
                        <Button
                          onClick={openConnectModal}
                          className="w-full"
                          variant="outline"
                        >
                          Connect Ethereum Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button
                          onClick={openChainModal}
                          className="w-full"
                          variant="destructive"
                        >
                          Wrong network
                        </Button>
                      );
                    }

                    return (
                      <div className="flex gap-2">
                        <Button
                          onClick={openChainModal}
                          variant="outline"
                          className="flex-1"
                        >
                          {chain.hasIcon && chain.iconUrl && (
                            <Image
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              width={16}
                              height={16}
                              className="mr-2"
                            />
                          )}
                          {chain.name}
                        </Button>
                        <Button
                          onClick={openAccountModal}
                          variant="outline"
                          className="flex-1"
                        >
                          {account.displayName}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              And
            </span>
          </div>
        </div>

        {/* Casper Network */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0011]">
              <Image
                src="/icons/casper.svg"
                alt="Casper"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </div>
            <div>
              <h3 className="font-semibold">Casper Network</h3>
              <p className="text-sm text-muted-foreground">
                {casperConnected ? "Connected" : "Disconnected"}
              </p>
            </div>
          </div>

          {!casperConnected ? (
            <Button
              onClick={handleCasperConnect}
              className="w-full"
              variant="outline"
            >
              Connect Casper Wallet
            </Button>
          ) : (
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
              <div className="flex items-center gap-2 text-sm text-green-500">
                <Check className="h-4 w-4" />
                <span>Connected to Casper</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Connect both wallets for full cross-chain functionality
      </div>
    </DialogContent>
  );
}

interface ConnectedWalletsProps {
  className?: string;
  evmConnected: boolean;
  evmAddress?: string;
  casperConnected: boolean;
  casperPublicKey: string | null;
}

function ConnectedWallets({
  className,
  evmConnected,
  evmAddress,
  casperConnected,
  casperPublicKey,
}: ConnectedWalletsProps) {
  const { disconnect: evmDisconnect } = useDisconnect();
  const { disconnect: casperDisconnect } = useCasperWallet();
  const [copiedEVM, setCopiedEVM] = useState(false);
  const [copiedCasper, setCopiedCasper] = useState(false);

  const formatAddress = (address: string, chars = 4) => {
    return `${address.substring(0, chars + 2)}...${address.substring(
      address.length - chars
    )}`;
  };

  const copyToClipboard = async (text: string, type: "evm" | "casper") => {
    await navigator.clipboard.writeText(text);
    if (type === "evm") {
      setCopiedEVM(true);
      setTimeout(() => setCopiedEVM(false), 2000);
    } else {
      setCopiedCasper(true);
      setTimeout(() => setCopiedCasper(false), 2000);
    }
    toast.success("Address copied!");
  };

  const handleDisconnectAll = async () => {
    if (evmConnected) evmDisconnect();
    if (casperConnected) await casperDisconnect();
    toast.success("Wallets disconnected");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            {evmConnected && casperConnected
              ? "Both Wallets"
              : evmConnected
                ? "Ethereum"
                : "Casper"}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {evmConnected && evmAddress && (
          <>
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#627EEA]">
                  <Image
                    src="/icons/ethereum.svg"
                    alt="Ethereum"
                    width={16}
                    height={16}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ethereum Network</p>
                  <p className="text-xs text-muted-foreground">
                    {formatAddress(evmAddress, 6)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => copyToClipboard(evmAddress, "evm")}
                >
                  {copiedEVM ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedEVM ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={() =>
                    window.open(
                      `https://amoy.polygonscan.com/address/${evmAddress}`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Explorer
                </Button>
              </div>
            </div>
          </>
        )}

        {evmConnected && casperConnected && <DropdownMenuSeparator />}

        {casperConnected && casperPublicKey && (
          <>
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF0011]">
                  <Image
                    src="/icons/casper.svg"
                    alt="Casper"
                    width={16}
                    height={16}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Casper Network</p>
                  <p className="text-xs text-muted-foreground">
                    {formatAddress(casperPublicKey, 6)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => copyToClipboard(casperPublicKey, "casper")}
                >
                  {copiedCasper ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedCasper ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={() =>
                    window.open(
                      `https://testnet.cspr.live/account/${casperPublicKey}`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Explorer
                </Button>
              </div>
            </div>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleDisconnectAll}
          className="text-red-500"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect All
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
