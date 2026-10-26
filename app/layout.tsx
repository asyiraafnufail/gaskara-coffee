import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gaskara Coffee — Web System",
  description: "POS Kasir, Web Pemesanan Customer, Live Queue Display & Admin Panel Gaskara Coffee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="bg-slate-50 text-slate-900 min-h-full flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-white">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
