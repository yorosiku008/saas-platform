import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="px-8 py-5 flex items-center justify-between border-b border-gray-100">
        <span className="font-bold text-blue-600 text-lg">FinOps JP SaaS</span>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">ログイン</Link>
          <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            無料で始める
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          β版 無料募集中
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AWS運用を、日本語で自動化する
        </h1>
        <p className="text-xl text-gray-500 mb-10">
          コスト削減・セキュリティ監査・インフラ評価を<br />
          AIが日本語レポートで自動生成します
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            β版に登録（3ヶ月無料）
          </Link>
          <Link href="/login" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            ログイン
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "FinOps JP", desc: "AWS月次コストを自動分析・日本語削減提案", color: "blue" },
            { title: "CloudGuard JP", desc: "IAM/S3/EC2セキュリティ監査を日本語レポートで", color: "red" },
            { title: "InfraScore JP", desc: "4軸100点スコアでインフラ健全性を可視化", color: "blue" },
          ].map((p) => (
            <div key={p.title} className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-sm text-gray-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
