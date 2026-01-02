"use client";

import Image from "next/image";
import { Button } from "@anchore/ui/components/button";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@anchore/ui/components/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletSelector } from "@/components/wallet-selector";
import { useWalletStatus } from "@/hooks/use-wallet-status";

export function Header() {
  const pathname = usePathname();
  const walletStatus = useWalletStatus();

  const isActive = (path: string) =>
    path === "/" ? path === pathname : pathname.startsWith(path);

  return (
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
          {/* Network Status Indicator (optional) */}
          {walletStatus.anyConnected && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm">
              {walletStatus.evm.connected && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs">EVM</span>
                </div>
              )}
              {walletStatus.casper.connected && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs">Casper</span>
                </div>
              )}
            </div>
          )}

          <WalletSelector />

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
  );
}
