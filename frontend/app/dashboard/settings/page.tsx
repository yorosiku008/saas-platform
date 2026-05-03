"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"

interface AwsConnection {
  id: string
  name: string
  aws_account_id: string | null
  role_arn: string
  created_at: string
}

export default function SettingsPage() {
  const [connections, setConnections] = useState<AwsConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [roleArn, setRoleArn] = useState("")
  const [accountId, setAccountId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { loadConnections() }, [])

  async function loadConnections() {
    try {
      const { data } = await api.get<AwsConnection[]>("/aws-connections/")
      setConnections(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      await api.post("/aws-connections/", { name, role_arn: roleArn, aws_account_id: accountId || null })
      setName(""); setRoleArn(""); setAccountId(""); setShowForm(false)
      await loadConnections()
    } catch {
      setError("接続の追加に失敗しました。Role ARN を確認してください")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("この接続を削除しますか？")) return
    await api.delete(`/aws-connections/${id}`)
    setConnections((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← ダッシュボード</Link>
        <span className="text-gray-400">/</span>
        <span className="text-sm font-medium text-gray-700">AWS接続設定</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">AWS接続管理</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 接続を追加
          </button>
        </div>

        {/* IAM Role 設定ガイド */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm">
          <p className="font-semibold text-blue-800 mb-2">AWSアカウントへの接続方法</p>
          <ol className="text-blue-700 space-y-1 list-decimal list-inside">
            <li>AWSコンソール → IAM → ロールを作成</li>
            <li>信頼エンティティ: 別のAWSアカウント（ID: <code className="bg-blue-100 px-1 rounded">123456789012</code>）</li>
            <li>ポリシー: <code className="bg-blue-100 px-1 rounded">ReadOnlyAccess</code> をアタッチ</li>
            <li>作成したロールのARN（<code className="bg-blue-100 px-1 rounded">arn:aws:iam::...</code>）を下記に入力</li>
          </ol>
        </div>

        {/* 追加フォーム */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">新規接続を追加</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
            )}
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">接続名</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  placeholder="例: 本番環境 / ステージング"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IAM Role ARN</label>
                <input
                  type="text" value={roleArn} onChange={(e) => setRoleArn(e.target.value)} required
                  placeholder="arn:aws:iam::123456789012:role/FinOpsReadOnly"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AWSアカウントID（任意）</label>
                <input
                  type="text" value={accountId} onChange={(e) => setAccountId(e.target.value)}
                  placeholder="123456789012"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit" disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "追加中..." : "追加"}
                </button>
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 接続一覧 */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : connections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
            <p>AWS接続がありません</p>
            <p className="text-sm mt-1">「接続を追加」からIAM Role ARNを登録してください</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {connections.map((conn, i) => (
              <div key={conn.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-gray-100" : ""}`}>
                <div>
                  <p className="font-medium text-gray-800">{conn.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{conn.role_arn}</p>
                  {conn.aws_account_id && (
                    <p className="text-xs text-gray-400">アカウントID: {conn.aws_account_id}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(conn.id)}
                  className="text-red-500 hover:text-red-700 text-sm transition-colors"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
