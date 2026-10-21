import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const viewport: Viewport = {
  themeColor: "#245C4A",
};

export const metadata: Metadata = {
  title: "MohallaMart - Your Neighbourhood, One Tap Away",
  description: "Fresh groceries, daily essentials and more from trusted local shops near you.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MohallaMart",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${instrumentSerif.variable} ${manrope.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col font-sans selection:bg-primary/20">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
