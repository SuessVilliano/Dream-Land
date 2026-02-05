import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LandScout - Sheriff Sale & Tax Auction Aggregator",
  description:
    "The Zillow for Off-Gridders. Find affordable land through sheriff sales, tax deed auctions, foreclosures, and surplus property sales.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
