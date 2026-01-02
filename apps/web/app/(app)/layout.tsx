import type { ReactNode } from "react";
import { Header } from "@/components/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="relative min-h-screen">
      <Header />
      <div className="isolate">{children}</div>
    </div>
  );
}
