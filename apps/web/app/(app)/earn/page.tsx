import { LiquidityPoolsCard } from "./_components/liquidity-pools-card";

export default function LiquidityPoolsPage() {
  return (
    <main
      className="container mx-auto p-4 overflow-y-auto"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <LiquidityPoolsCard />
    </main>
  );
}
