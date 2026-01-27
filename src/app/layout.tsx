import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Open Dashboard",
  description: "Phase 0 foundation for the BI platform"
};

const bodyStyle = {
  margin: 0,
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  backgroundColor: "#f5f6f8",
  color: "#111827"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={bodyStyle}>{children}</body>
    </html>
  );
}
