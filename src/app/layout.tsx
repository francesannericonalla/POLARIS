import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POLARIS \u2014 CIT-U Quality Assurance Office",
  description: "Performance and Organization Leadership Analytics, Reporting, and Institutional Stewardship",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
