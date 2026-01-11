import { Button } from "@anchore/ui/components/button";
import { Badge } from "@anchore/ui/components/badge";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BatteryCharging,
  Globe2,
  Layers,
  Link2,
  Lock,
  ShieldCheck,
  Sparkles,
  Zap,
  Terminal,
  Activity,
} from "lucide-react";

// --- Mock Data ---
const stats = [
  { label: "Total Value Locked", value: "$4.2M" },
  { label: "Total Volume", value: "$12.5M" },
  { label: "Active Pools", value: "8" },
];

const flows = [
  {
    title: "Deposit",
    accent: "from-blue-500/20 to-indigo-500/20",
    steps: ["Connect Wallet", "Approve Token", "Confirm Deposit"],
  },
  {
    title: "Bridge",
    accent: "from-emerald-500/20 to-teal-500/20",
    steps: ["Select Chain", "Sign Message", "Claim Funds"],
  },
  {
    title: "Swap",
    accent: "from-purple-500/20 to-pink-500/20",
    steps: ["Choose Pair", "Set Slippage", "Execute Swap"],
  },
];

const pools = [
  { pair: "CSPR / ETH", state: "Active", apr: "12.5%", bridge: "Synced" },
  { pair: "CSPR / USDC", state: "Hot", apr: "8.2%", bridge: "Synced" },
  { pair: "ETH / USDT", state: "Active", apr: "5.4%", bridge: "Synced" },
];

const guardrails = [
  "Multi-sig Operator Validation",
  "Automated Nonce Tracking",
  "Emergency Pause Functionality",
];

export default function AnchoreLanding() {
  return (
    <main className="relative overflow-hidden bg-[#030712] text-foreground pb-24">
      {/* --- Hex / Tech Background Layer --- */}
      <div className="absolute inset-0 z-0">
        {/* Radial Gradient Centers */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[80vw] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[500px] w-[80vw] bg-emerald-500/5 blur-[100px] rounded-full mix-blend-screen" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-8 pt-20 md:pt-32">
        {/* --- Hero Section (Centered "Hex AI" Style) --- */}
        <section className="flex flex-col items-center text-center space-y-10 mb-24">
          {/* Animated Pill */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 pr-4 backdrop-blur-xl">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-white/70 tracking-wide">
                Protocol V1 Live on Mainnet
              </span>
              <div className="h-3 w-px bg-white/10 mx-1" />
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                Secured <ShieldCheck className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Main Typography */}
          <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60">
              The Liquidity Layer for <br className="hidden md:block" />
              <span className="text-white">Casper Network</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed">
              Unified AMM and Bridge. Provision liquidity once, route trades
              seamlessly between Casper and Ethereum, and keep flows safe with
              operator-secured vaults.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link href="/bridge">
              <Button
                size="lg"
                className="h-12 rounded-full px-8 text-base bg-white text-black hover:bg-slate-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
              >
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
              >
                Read Documentation
              </Button>
            </Link>
          </div>

          {/* --- The "Hex AI" Style Dashboard Preview --- */}
          <div className="w-full max-w-6xl mt-16 relative group animate-in fade-in zoom-in-95 duration-1000 delay-500">
            {/* Glow Behind */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-emerald-500/20 to-purple-500/20 rounded-xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000" />

            {/* Glass Container */}
            <div className="relative rounded-xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md shadow-2xl overflow-hidden">
              {/* Window Header */}
              <div className="h-10 border-b border-white/5 bg-black/50 flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-white/10" />
                  <div className="h-3 w-3 rounded-full bg-white/10" />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
                  Console • Mainnet • read-only
                </div>
                <div className="w-8" />
              </div>

              {/* Dashboard UI Mockup */}
              <div className="p-6 md:p-10 grid gap-8 md:grid-cols-[2fr_1fr]">
                {/* Left: Chart/Swap Area */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Link2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">
                          Bridge Route
                        </div>
                        <div className="text-xl font-semibold text-white">
                          Ethereum{" "}
                          <span className="text-slate-600 mx-2">→</span> Casper
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                    >
                      Low Fees
                    </Badge>
                  </div>

                  {/* Fake Chart */}
                  <div className="h-48 w-full rounded-lg border border-white/5 bg-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-end px-4 pb-4 gap-2">
                      {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-indigo-500/20 rounded-sm hover:bg-indigo-500/40 transition-colors"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="absolute top-4 left-4 text-xs text-slate-500">
                      Volume (24h)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-xs text-slate-500 mb-1">
                        Est. Receive
                      </div>
                      <div className="text-lg font-mono text-white">
                        4,250.00 CSPR
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-xs text-slate-500 mb-1">
                        Bridge Fee
                      </div>
                      <div className="text-lg font-mono text-white">~0.05%</div>
                    </div>
                  </div>
                </div>

                {/* Right: Terminal / Activity */}
                <div className="hidden md:flex flex-col gap-4">
                  <div className="rounded-lg border border-white/5 bg-black/40 p-4 h-full font-mono text-xs text-slate-400">
                    <div className="flex items-center gap-2 mb-4 text-white/60 border-b border-white/5 pb-2">
                      <Terminal className="h-3 w-3" /> System Logs
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <span className="text-emerald-500">success</span>
                        <span>Oracle update block #8921</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-blue-500">info</span>
                        <span>AMM Pool [CSPR-USDC] rebalanced</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-emerald-500">success</span>
                        <span>Bridge Vault: Nonce #442 verified</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-purple-500">event</span>
                        <span>Liquidity added: 50k CSPR</span>
                      </div>
                      <div className="animate-pulse flex gap-2">
                        <span className="text-slate-500">...</span>
                        <span>Listening for events</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- How it Works (Grid Style) --- */}
        <section className="mb-24">
          <div className="mb-12 md:text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold md:text-4xl text-white mb-4">
              Unified Architecture
            </h2>
            <p className="text-slate-400 text-lg">
              Anchore separates execution from custody. Operators attest to
              actions while custody remains isolated in vault contracts.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Unified Surface
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                AMM pools and bridge vaults behave as one surface, reducing
                fragmentation across the network.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Operator Safeguards
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Whitelisted signatures plus nonces mitigate replay attacks.
                Security is baked into the contract level.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <BatteryCharging className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Efficient Exits
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Hybrid swap routing reduces hops for Casper ↔ Ethereum
                transfers, saving gas and time.
              </p>
            </div>
          </div>
        </section>

        {/* --- Active Pools (List Style) --- */}
        <section className="border-t border-white/10 pt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Market Spotlight
              </h2>
              <p className="text-slate-400">
                Live liquidity pools with bridge awareness.
              </p>
            </div>
            <Link href="/earn">
              <Button
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/10 gap-2"
              >
                View All Pools <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {pools.map((pool) => (
              <div
                key={pool.pair}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-indigo-500/50 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold text-lg text-white group-hover:text-indigo-400 transition-colors">
                    {pool.pair}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-0"
                  >
                    {pool.state}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <BarChart3 className="h-4 w-4" />
                    <span className="font-medium text-white">
                      {pool.apr} APR
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Activity className="h-3 w-3" />
                    {pool.bridge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
