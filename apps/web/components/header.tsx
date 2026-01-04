"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@anchore/ui/components/button";
import { Menu, Wallet, ChevronDown } from "lucide-react";
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
        <div className="container flex h-20 max-w-screen-2xl items-center justify-between w-full">
          <Link className="flex items-center gap-[2px]" href="/">
            <Image
              src="/assets/anchore-logo.png"
              width={15}
              height={15}
              alt="Anchore logo"
              className="shadow-sm"
            />
            <p className="text-3xl font-bold">nchore</p>
          </Link>

          <nav className="hidden md:flex space-x-4">
            <Link href="/bridge">
              <Button
                variant={isActive("/bridge") ? "default" : "ghost"}
                className="font-semibold"
              >
                Bridge
              </Button>
            </Link>
            <Link href="/history">
              <Button
                variant={isActive("/history") ? "default" : "ghost"}
                className="font-semibold"
              >
                History
              </Button>
            </Link>
            <Link href="/earn">
              <Button
                variant={isActive("/earn") ? "default" : "ghost"}
                className="font-semibold"
              >
                Earn
              </Button>
            </Link>
          </nav>

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link href="/bridge">
                  <DropdownMenuItem>Bridge</DropdownMenuItem>
                </Link>
                <Link href="/history">
                  <DropdownMenuItem>History</DropdownMenuItem>
                </Link>
                <Link href="/earn">
                  <DropdownMenuItem>Earn</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <WalletSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
}
