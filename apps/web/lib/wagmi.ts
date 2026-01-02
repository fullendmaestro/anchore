import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { polygon, polygonAmoy } from "wagmi/chains";
import type { Config } from "wagmi";

export const wagmiConfig: Config = getDefaultConfig({
  appName: "Anchore Liquidity Protocol",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [
    polygonAmoy,
    ...(process.env.NODE_ENV === "production" ? [polygon] : []),
  ] as const,
  transports: {
    [polygonAmoy.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true,
});
