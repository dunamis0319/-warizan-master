import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "割り算マスター",
  description: "わり算れんしゅうゲーム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${nunito.variable} font-[family-name:var(--font-nunito)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
