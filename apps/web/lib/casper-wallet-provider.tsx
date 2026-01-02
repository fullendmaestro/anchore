"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PublicKey } from "casper-js-sdk";

interface CasperWalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  provider: any;
  accountHash: string | null;
}

const CasperWalletContext = createContext<CasperWalletContextType>({
  publicKey: null,
  isConnected: false,
  connect: async () => {},
  disconnect: async () => {},
  provider: null,
  accountHash: null,
});

export function CasperWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [accountHash, setAccountHash] = useState<string | null>(null);

  useEffect(() => {
    // Check if Casper Wallet is installed
    const checkProvider = () => {
      if (
        typeof window !== "undefined" &&
        (window as any).CasperWalletProvider
      ) {
        const casperProvider = (window as any).CasperWalletProvider();
        setProvider(casperProvider);

        // Check if already connected
        casperProvider
          .isConnected()
          .then((connected: boolean) => {
            if (connected) {
              getActivePublicKey(casperProvider);
            }
          })
          .catch((err: any) => console.error("Connection check failed:", err));
      }
    };

    // Initial check
    checkProvider();

    // Listen for provider injection
    const handleLoad = () => checkProvider();
    window.addEventListener("load", handleLoad);

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  const getActivePublicKey = async (casperProvider: any) => {
    try {
      const activeKey = await casperProvider.getActivePublicKey();
      setPublicKey(activeKey);

      // Calculate account hash
      if (activeKey) {
        const publicKeyObj = PublicKey.fromHex(activeKey);
        const accHash = publicKeyObj.accountHash().toPrefixedString();
        setAccountHash(accHash);
      }
    } catch (error: any) {
      console.error("Failed to get active public key:", error);
      if (error === 1) {
        console.error("Wallet is locked");
      } else if (error === 2) {
        console.error("Not approved to connect");
      }
    }
  };

  const connect = async () => {
    if (!provider) {
      alert(
        "Casper Wallet is not installed. Please install it from https://www.casperwallet.io/"
      );
      return;
    }

    try {
      const connected = await provider.requestConnection();
      if (connected) {
        await getActivePublicKey(provider);
      }
    } catch (error) {
      console.error("Connection failed:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    if (!provider) return;

    try {
      const disconnected = await provider.disconnectFromSite();
      if (disconnected) {
        setPublicKey(null);
        setAccountHash(null);
      }
    } catch (error) {
      console.error("Disconnection failed:", error);
      throw error;
    }
  };

  const value: CasperWalletContextType = {
    publicKey,
    isConnected: !!publicKey,
    connect,
    disconnect,
    provider,
    accountHash,
  };

  return (
    <CasperWalletContext.Provider value={value}>
      {children}
    </CasperWalletContext.Provider>
  );
}

export function useCasperWallet() {
  const context = useContext(CasperWalletContext);
  if (!context) {
    throw new Error("useCasperWallet must be used within CasperWalletProvider");
  }
  return context;
}
