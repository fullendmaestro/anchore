import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Anchore | Casper-first liquidity layer",
  description:
    "Anchore blends a Casper-native AMM with a cross-chain bridge so liquidity can move securely between Casper and Ethereum.",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(99,102,241,0.14),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(45,212,191,0.14),transparent_28%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:120px_120px]" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
