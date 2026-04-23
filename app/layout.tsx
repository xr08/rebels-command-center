import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rebels Command Center",
  description: "Social post generator dashboard for Fremantle Rebels."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
