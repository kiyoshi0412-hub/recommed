import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "企業訴求ポイント管理",
  description: "ドライバー人材紹介 - 企業訴求ポイント管理ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
