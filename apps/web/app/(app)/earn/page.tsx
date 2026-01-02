import { BridgingCard } from "./_components/bridging-card";

export default function BridgingPage() {
  return (
    <main
      className="container mx-auto p-4 overflow-y-auto"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <BridgingCard />
    </main>
  );
}
