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
} from "lucide-react";

const stats = [
  { label: "Live on", value: "Casper mainnet" },
  { label: "Bridge reach", value: "Ethereum ↔ Casper" },
  { label: "Security", value: "Operator-signed + nonces" },
];

const flows = [
  {
    title: "Trade on Casper",
    steps: ["Select pair", "Route through x*y=k pool", "Settle instantly"],
    accent: "from-emerald-400/60 via-primary/40 to-blue-400/60",
  },
  {
    title: "Bridge to Ethereum",
    steps: [
      "Deposit to vault",
      "Operator signs with nonce",
      "Mint or release on L1",
    ],
    accent: "from-orange-300/60 via-amber-300/30 to-primary/50",
  },
  {
    title: "Provide liquidity",
    steps: ["Add to Casper pool", "Earn AMM fees", "Capture bridge volume"],
    accent: "from-sky-300/60 via-primary/40 to-emerald-300/60",
  },
];

const pools = [
  {
    pair: "CSPR / USDC",
    state: "Live",
    apr: "Base AMM fees",
    bridge: "Enabled",
  },
  {
    pair: "ETH / CSPR",
    state: "Live",
    apr: "Hybrid exits",
    bridge: "Enabled",
  },
  {
    pair: "WBTC / USDC",
    state: "Queued",
    apr: "Bridge-led volume",
    bridge: "Warming up",
  },
];

const guardrails = [
  "Operator whitelist with signature checks",
  "Nonce tracking to block replay and drift",
  "On-chain validation on Casper and Ethereum",
  "Separation of execution and custody for bridge flows",
];

const heroIllustration = {
  src: "/assets/anchore-bridge-hero.png",
  alt: "Anchore cross-chain liquidity illustration connecting Casper and Ethereum",
};

export default function Page() {
  return (
    <main className="relative overflow-hidden pb-20 pt-14 md:pt-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_12%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_90%_18%,rgba(52,211,153,0.18),transparent_28%)]" />

      <div className="container mx-auto flex flex-col gap-16 px-6 md:px-8">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span>Anchore</span>
              <span className="h-1 w-1 rounded-full bg-primary" aria-hidden />
              <span>Casper liquidity layer</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight md:text-5xl md:leading-[1.05]">
                The AMM and bridge built for Casper; liquid, secure, and
                cross-chain ready.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                Anchore pairs a Casper-native constant-product AMM with an
                operator-secured bridge to Ethereum. Provision once, route
                trades seamlessly, and keep flows safe with signatures and
                nonces that close replay gaps.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/bridge">
                <Button
                  size="lg"
                  className="gap-2 rounded-2xl px-6 shadow-lg shadow-primary/20"
                >
                  Launch bridge
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/earn">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-2xl px-6 border-border/70"
                >
                  Provide liquidity
                </Button>
              </Link>
              <Badge
                variant="secondary"
                className="rounded-full border border-primary/20 bg-primary/10 text-primary"
              >
                Casper ↔ Ethereum live
              </Badge>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-primary">
                    {item.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative space-y-6">
            <div
              className="absolute -left-6 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-3xl"
              aria-hidden
            />

            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background/85 via-card/85 to-primary/10 shadow-xl shadow-primary/15">
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_18%_26%,rgba(99,102,241,0.16),transparent_32%),radial-gradient(circle_at_84%_18%,rgba(52,211,153,0.16),transparent_30%)]"
                aria-hidden
              />
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Casper ↔ Ethereum
              </div>
              <Image
                src={heroIllustration.src}
                alt={heroIllustration.alt}
                width={1200}
                height={900}
                priority
                className="relative h-full w-full object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 grid gap-3 rounded-2xl border border-border/60 bg-background/80/80 p-4 backdrop-blur">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  <span>Network state</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] text-primary">
                    <Zap className="h-3.5 w-3.5" />
                    Live
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-card/80 p-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between text-foreground">
                      <span>Casper AMM</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Active
                      </span>
                    </div>
                    <p className="mt-1 text-xs">
                      x*y=k pools with native LP shares.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card/80 p-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between text-foreground">
                      <span>Bridge vaults</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                        <Link2 className="h-3.5 w-3.5" />
                        Synced
                      </span>
                    </div>
                    <p className="mt-1 text-xs">
                      Operator-signed releases with nonce tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-card/70 p-4 text-sm text-muted-foreground shadow-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <Layers className="h-4 w-4 text-primary" />
                  Unified liquidity
                </div>
                <p className="mt-2 text-xs">
                  AMM pools and bridge vaults behave as one surface.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/70 p-4 text-sm text-muted-foreground shadow-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <Lock className="h-4 w-4 text-primary" />
                  Operator safeguards
                </div>
                <p className="mt-2 text-xs">
                  Whitelisted signatures plus nonces mitigate replay.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/70 p-4 text-sm text-muted-foreground shadow-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <BatteryCharging className="h-4 w-4 text-primary" />
                  Efficient exits
                </div>
                <p className="mt-2 text-xs">
                  Hybrid swaps reduce hops for Casper ↔ Ethereum.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-border/70 bg-card/60 p-6 shadow-lg backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              How Anchore works
            </div>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              Unified liquidity between Casper and Ethereum
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              LP once on Casper, access flow on both sides. The AMM prices
              locally while bridge vaults mirror state and enforce operator
              signatures with nonce tracking to keep routes honest.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Globe2 className="h-4 w-4 text-primary" />
                  Casper-first, Ethereum-ready
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Casper-native settlement with optional bridge egress to L1.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Link2 className="h-4 w-4 text-primary" />
                  Hybrid swaps
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Route trades that span AMM pools and bridge vaults without
                  fragmentation.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {flows.map((flow) => (
              <div
                key={flow.title}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/80 p-4"
              >
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${flow.accent} opacity-30`}
                  aria-hidden
                />
                <p className="text-xs uppercase tracking-[0.16em] text-primary">
                  {flow.title}
                </p>
                <div className="mt-3 space-y-2 text-sm text-foreground">
                  {flow.steps.map((step) => (
                    <div
                      key={step}
                      className="flex items-center gap-2 rounded-lg bg-card/60 px-2 py-1.5 text-muted-foreground"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-primary">
                Liquidity surface
              </p>
              <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                Pool spotlight
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                AMM pools on Casper with bridge awareness. Provide liquidity and
                capture both local swaps and cross-chain flow.
              </p>
            </div>
            <Link href="/earn">
              <Button
                variant="secondary"
                className="rounded-xl border-border/70 bg-card/70"
              >
                View pools
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {pools.map((pool) => (
              <div
                key={pool.pair}
                className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {pool.pair}
                  </p>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                    {pool.state}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    {pool.apr}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    Bridge status: {pool.bridge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-lg md:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">
              Security posture
            </p>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              Guardrails for bridge and AMM
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Anchore keeps execution and custody separated while enforcing
              operator signatures and nonce tracking so cross-chain flows remain
              verifiable.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {guardrails.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2"
                >
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/10 p-6">
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-emerald-300/20"
              aria-hidden
            />
            <div className="relative space-y-3 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                Monitoring & attestations
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                Separation of concerns
              </div>
              <p>
                Operators attest to each bridge action while custody remains
                isolated in vault contracts. Casper-side AMM state is
                independently verifiable.
              </p>
              <div className="flex items-center gap-2 text-foreground">
                <Lock className="h-4 w-4 text-primary" />
                Replay protection
              </div>
              <p>
                Nonce tracking and signature requirements reduce replay risk
                across chains and keep vault releases aligned with AMM
                execution.
              </p>
              <div className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-4 w-4 text-primary" />
                Transparent metrics
              </div>
              <p>
                Pool depth, bridge capacity, and operator status are surfaced so
                LPs and integrators can route with confidence.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card/70 p-6 text-center shadow-lg">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">
              Get started
            </p>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              Launch Anchore and move liquidity with confidence
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Spin up the Casper-native AMM experience or bridge value to
              Ethereum with operator validation baked in. Anchore keeps
              liquidity unified across chains.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/bridge">
                <Button size="lg" className="gap-2 rounded-2xl px-6">
                  Launch bridge
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl px-6 border-border/70"
                >
                  Read the docs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
