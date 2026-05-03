"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"

interface PlanInfo {
  plan: string
  scan_limit: number
  features: {
    ai_suggestions: boolean
    unlimited_scans: boolean
    multi_user: boolean
  }
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "¥0",
    period: "/月",
    scans: "3回/月",
    features: ["デモスキャン3回/月", "CLIダウンロード", "基本レポート"],
    color: "gray",
  },
  {
    id: "starter",
    name: "Starter",
    price: "¥5,800",
    period: "/月",
    scans: "30回/月",
    features: ["スキャン30回/月", "AI削減提案（月5回）", "Markdownレポート", "3ユーザーまで"],
    color: "blue",
    recommended: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "¥14,800",
    period: "/月",
    scans: "無制限",
    features: ["スキャン無制限", "AI提案無制限", "全5製品対応", "10ユーザーまで", "優先サポート"],
    color: "blue",
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "¥29,800〜",
    period: "/月",
    scans: "無制限",
    features: ["全Pro機能", "ユーザー無制限", "SSO対応", "SLA保証", "専任CSM"],
    color: "purple",
  },
]

export default function BillingPage() {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    api.get<PlanInfo>("/billing/current-plan")
      .then(({ data }) => setPlanInfo(data))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpgrade(planId: string) {
    if (planId === "enterprise") {
      window.location.href = "mailto:yorosiku008@gmail.com?subject=Enterprise プランのお問い合わせ"
      return
    }
    setUpgrading(planId)
    try {
      const { data } = await api.post<{ checkout_url: string }>("/billing/create-checkout-session", null, {
        params: { plan: planId },
      })
      window.location.href = data.checkout_url
    } catch {
      alert("決済ページへの遷移に失敗しました。しばらくしてから再試行してください")
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← ダッシュボード</Link>
        <span className="text-gray-400">/</span>
        <span className="text-sm font-medium text-gray-700">プラン・課金</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">プラン・課金</h1>
          {!loading && planInfo && (
            <p className="text-sm text-gray-500">
              現在のプラン:{" "}
              <span className="font-semibold text-gray-800">{planInfo.plan.toUpperCase()}</span>
              {planInfo.plan === "free" && (
                <span className="ml-2 text-green-600 font-medium">（β版: 3ヶ月無料）</span>
              )}
            </p>
          )}
        </div>

        {/* β版バナー */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-sm text-green-800">
          <p className="font-semibold">🎉 β版特典</p>
          <p>β版ユーザーの方は3ヶ月間 Pro 相当の機能を無料でご利用いただけます。正式版移行時は6ヶ月間50%OFFでご提供します。</p>
        </div>

        {/* プランカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = planInfo?.plan === plan.id
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-5 border-2 relative ${
                  plan.recommended ? "border-blue-500 shadow-lg" : "border-gray-100"
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    おすすめ
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    利用中
                  </span>
                )}

                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                <div className="my-3">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">スキャン: {plan.scans}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full text-center text-sm text-gray-400 py-2">現在のプラン</div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                      plan.recommended
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    {upgrading === plan.id ? "処理中..." :
                      plan.id === "enterprise" ? "お問い合わせ" : "アップグレード"}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ご質問は <a href="mailto:yorosiku008@gmail.com" className="text-blue-600 hover:underline">yorosiku008@gmail.com</a> までお気軽にどうぞ
        </p>
      </main>
    </div>
  )
}
