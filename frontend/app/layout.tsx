import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FinOps JP SaaS | AWSコスト最適化・セキュリティ監査",
  description: "AWS特化・日本語ネイティブのSaaSプラットフォーム",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  )
}
