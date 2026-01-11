"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@anchore/ui/components/button";
import { ArrowLeft, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@anchore/ui/components/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletSidebar } from "@/components/wallet-sidebar";
import { useWalletStatus } from "@/hooks/use-wallet-status";
import { useAccount } from "wagmi";
import { useCasperWallet } from "@/lib/casper-wallet-provider";

export function Header() {
  const pathname = usePathname();
  const walletStatus = useWalletStatus();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { address: evmAddress } = useAccount();
  const { publicKey: casperPublicKey } = useCasperWallet();

  const isActive = (path: string) =>
    path === "/" ? path === pathname : pathname.startsWith(path);

  const bothConnected =
    walletStatus.evm.connected && walletStatus.casper.connected;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 max-w-screen-2xl w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center" href="/bridge">
            <Button
              variant="ghost"
              size="sm"
              className="group gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 hover:-translate-y-[1px] hover:border-primary/60 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-medium">Back to bridge</span>
            </Button>
          </Link>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setSidebarOpen(true)}
              variant="ghost"
              size="default"
              className="h-10 px-3 text-base font-medium border border-border rounded-lg bg-transparent hover:bg-accent/50 hover:border-accent-foreground"
            >
              {bothConnected ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border">
                    <Image
                      src="/icons/networks/ethereum.svg"
                      alt="Sepolia"
                      width={16}
                      height={16}
                      className="flex-shrink-0"
                    />
                    <span className="text-sm font-medium">
                      {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border">
                    <Image
                      src="/icons/networks/Casper.png"
                      alt="Casper"
                      width={16}
                      height={16}
                      className="flex-shrink-0"
                    />
                    <span className="text-sm font-medium">
                      {casperPublicKey?.slice(0, 6)}...
                      {casperPublicKey?.slice(-4)}
                    </span>
                  </div>
                </div>
              ) : walletStatus.anyConnected ? (
                <>
                  {walletStatus.evm.connected && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border">
                      <Image
                        src="/icons/networks/ethereum.svg"
                        alt="Sepolia"
                        width={16}
                        height={16}
                        className="flex-shrink-0"
                      />
                      <span className="text-sm font-medium">
                        {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
                      </span>
                    </div>
                  )}
                  {walletStatus.casper.connected && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border">
                      <Image
                        src="/icons/networks/Casper.png"
                        alt="Casper"
                        width={16}
                        height={16}
                        className="flex-shrink-0"
                      />
                      <span className="text-sm font-medium">
                        {casperPublicKey?.slice(0, 6)}...
                        {casperPublicKey?.slice(-4)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <WalletSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
}
