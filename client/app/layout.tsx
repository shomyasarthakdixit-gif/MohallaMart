import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";
import { PageTransition } from "../components/page-transition";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MohallaMart",
  description: "Your hyperlocal neighborhood marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${inter.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <PageTransition>
            {children}
          </PageTransition>
        </Providers>
      </body>
    </html>
  );
}
