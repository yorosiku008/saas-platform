import Link from "next/link"

const PRODUCTS = [
  {
    name: "FinOps JP",
    desc: "AWSコストをClaude AIが日本語で分析し、削減提案を自動生成。稟議書にそのまま貼れるレポート出力。",
    color: "blue",
    icon: "💰",
  },
  {
    name: "CloudGuard JP",
    desc: "S3・IAM・EC2・CloudTrailの設定ミスを自動検出。CRITICAL→HIGH順で優先度付き日本語レポートを出力。",
    color: "red",
    icon: "🛡️",
  },
  {
    name: "InfraScore JP",
    desc: "可用性・パフォーマンス・セキュリティ・コスト効率の4軸で100点スコアリング。CTO報告書を自動生成。",
    color: "green",
    icon: "📊",
  },
  {
    name: "SupplyGuard JP",
    desc: "SBOM分析・CVE検出・アンケートでサプライヤーをグレーディング。EU CRA・経産省ガイドライン準拠。",
    color: "purple",
    icon: "🔗",
  },
  {
    name: "ZeroVis JP",
    desc: "ID・デバイス・アプリ・ネットワークの4軸でゼロトラスト成熟度を数値化。NISC/総務省ガイドライン対応。",
    color: "indigo",
    icon: "🔒",
  },
]

const COLOR_MAP: Record<string, string> = {
  blue:   "bg-blue-50 border-blue-200 text-blue-700",
  red:    "bg-red-50 border-red-200 text-red-700",
  green:  "bg-green-50 border-green-200 text-green-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-600 text-lg">AWS JP Suite</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">β版</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">ログイン</Link>
          <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            無料で始める
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="max-w-3xl mx-auto px-8 py-20 text-center">
        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          β版ユーザー募集中 — 3ヶ月無料
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-5 leading-tight">
          AWS運用の全領域を、<br />
          <span className="text-blue-600">日本語AI</span>で自動化する
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          コスト削減・セキュリティ監査・インフラ評価・サプライチェーン・ゼロトラスト。<br />
          Claude AIが日本語レポートを自動生成します。
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            β版に登録（3ヶ月無料）
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </section>

      {/* 5製品カード */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-3">5製品すべて1つのプラットフォームで</h2>
        <p className="text-center text-gray-500 text-sm mb-10">すべての製品でデモモード搭載。AWSアカウントなしで即確認できます。</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-6 ${COLOR_MAP[p.color]}`}
            >
              <div className="text-2xl mb-3">{p.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{p.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
          {/* 空白スロット（3列レイアウト調整用） */}
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 flex items-center justify-center">
            <p className="text-sm text-gray-400 text-center">更なる製品を<br />開発中...</p>
          </div>
        </div>
      </section>

      {/* 特徴 */}
      <section className="bg-gray-50 py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl font-bold text-gray-800 mb-10">なぜ AWS JP Suite が選ばれるか</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: "🇯🇵", title: "日本語ネイティブ", desc: "競合10社はすべて英語のみ。稟議書・報告書にそのままコピーできる日本語レポートを出力します。" },
              { icon: "🤖", title: "Claude AI搭載", desc: "Anthropic の最新モデルが改善提案・根拠・具体的な手順まで日本語で生成。英語ドキュメント不要。" },
              { icon: "🔒", title: "ReadOnly接続", desc: "AWSには読み取り専用で接続。リソースの変更・削除は一切行いません。セキュリティチェック済み。" },
            ].map((f) => (
              <div key={f.title}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <section className="py-16 px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">今すぐβ版を始める</h2>
        <p className="text-gray-500 mb-6">3ヶ月間無料。月1回15分のフィードバックのみお願いします。</p>
        <Link
          href="/register"
          className="inline-block bg-blue-600 text-white px-10 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
        >
          無料で始める →
        </Link>
      </section>
    </main>
  )
}
