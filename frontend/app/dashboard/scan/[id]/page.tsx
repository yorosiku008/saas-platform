"use client"
import { useEffect, useState } from "react"
import { getScan, PRODUCT_LABELS, Scan } from "@/lib/scans"
import { ScanResultRenderer } from "@/components/ScanResultRenderer"
import Link from "next/link"

export default function ScanDetailPage({ params }: { params: { id: string } }) {
  const [scan, setScan] = useState<Scan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getScan(params.id)
        setScan(data)
      } finally {
        setLoading(false)
      }
    }
    load()
    // 実行中は5秒ごとにポーリング
    const timer = setInterval(async () => {
      const data = await getScan(params.id).catch(() => null)
      if (data) {
        setScan(data)
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(timer)
        }
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">スキャンが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          ← ダッシュボードに戻る
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">{PRODUCT_LABELS[scan.product]} スキャン結果</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              scan.status === "completed" ? "bg-green-100 text-green-800" :
              scan.status === "failed" ? "bg-red-100 text-red-800" :
              "bg-yellow-100 text-yellow-800"
            }`}>
              {scan.status === "completed" ? "完了" : scan.status === "failed" ? "失敗" : "処理中..."}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            実行日時: {new Date(scan.created_at).toLocaleString("ja-JP")}
          </p>
          {scan.completed_at && (
            <p className="text-sm text-gray-500">
              完了日時: {new Date(scan.completed_at).toLocaleString("ja-JP")}
            </p>
          )}
        </div>

        {scan.result && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">スキャン結果</h2>
            <ScanResultRenderer product={scan.product} result={scan.result} />
          </div>
        )}

        {scan.status === "running" || scan.status === "pending" ? (
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <p className="text-blue-700">スキャンを実行中です。5秒ごとに自動更新します...</p>
          </div>
        ) : null}
      </main>
    </div>
  )
}
