"use client";

import {
  CsprClickInitOptions,
  CONTENT_MODE,
} from "@make-software/csprclick-core-types";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "sonner";
import { wagmiConfig } from "@/lib/wagmi";
import { CasperWalletProvider } from "@/lib/casper-wallet-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

const clickOptions: CsprClickInitOptions = {
  appName: "app",
  contentMode: CONTENT_MODE.IFRAME,
  providers: [
    "casper-wallet",
    "ledger",
    "torus-wallet",
    "casperdash",
    "metamask-snap",
    "casper-signer",
  ],
  appId: "sds",
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CasperWalletProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            {children}
            <Toaster richColors position="top-center" />
          </NextThemesProvider>
        </CasperWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
