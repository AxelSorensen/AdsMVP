import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scouter Ads | AI-Powered Google Ads Generator",
  description:
    "Revolutionize your Google Ads strategy with AI-driven campaign generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
