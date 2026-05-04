"use client"
import { useEffect, useState } from "react"
import { listScans, createScan, PRODUCT_LABELS, Scan, Product } from "@/lib/scans"
import { logout } from "@/lib/auth"
import Link from "next/link"

const STATUS_BADGE: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  running:   "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed:    "bg-red-100 text-red-800",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "待機中", running: "実行中", completed: "完了", failed: "失敗",
}

const PRODUCTS: Product[] = ["finops", "cloudguard", "infrascore", "supplyguard", "zerovis"]

export default function DashboardPage() {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadScans()
  }, [])

  async function loadScans() {
    try {
      const data = await listScans()
      setScans(data)
    } catch {
      // 認証エラーは interceptor が処理
    } finally {
      setLoading(false)
    }
  }

  async function handleNewScan(product: Product) {
    setCreating(true)
    try {
      const scan = await createScan(product, true)
      setScans((prev) => [scan, ...prev])
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg text-blue-600">AWS JP Suite</span>
          <nav className="flex items-center gap-4 text-sm">
            <span className="text-gray-800 font-medium">ダッシュボード</span>
            <Link href="/dashboard/settings" className="text-gray-500 hover:text-gray-800 transition-colors">AWS接続</Link>
            <Link href="/dashboard/billing" className="text-gray-500 hover:text-gray-800 transition-colors">プラン</Link>
          </nav>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ログアウト
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 新規スキャン */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">新規スキャン（デモ）</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {PRODUCTS.map((product) => (
              <button
                key={product}
                onClick={() => handleNewScan(product)}
                disabled={creating}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <div className="text-sm font-semibold text-gray-800">{PRODUCT_LABELS[product]}</div>
                <div className="text-xs text-gray-400 mt-1">デモ実行</div>
              </button>
            ))}
          </div>
        </section>

        {/* スキャン一覧 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">スキャン履歴</h2>
            <button
              onClick={loadScans}
              className="text-sm text-blue-600 hover:underline"
            >
              更新
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">読み込み中...</div>
          ) : scans.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>スキャン履歴がありません</p>
              <p className="text-sm mt-1">上のボタンから最初のスキャンを実行してください</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">プロダクト</th>
                    <th className="px-4 py-3 text-left">ステータス</th>
                    <th className="px-4 py-3 text-left">実行日時</th>
                    <th className="px-4 py-3 text-left">詳細</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{PRODUCT_LABELS[scan.product]}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[scan.status]}`}>
                          {STATUS_LABEL[scan.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(scan.created_at).toLocaleString("ja-JP")}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/scan/${scan.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          詳細 →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
