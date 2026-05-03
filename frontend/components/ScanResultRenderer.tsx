"use client"
import { Product } from "@/lib/scans"

interface Props {
  product: Product
  result: Record<string, unknown>
}

const GRADE_COLOR: Record<string, string> = {
  S: "bg-purple-100 text-purple-800",
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  E: "bg-red-100 text-red-800",
  F: "bg-red-100 text-red-800",
}

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-gray-100 text-gray-600",
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-medium w-8 text-right">{score}</span>
    </div>
  )
}

function AiSuggestions({ text }: { text: string }) {
  if (!text) return null
  return (
    <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-blue-600 font-semibold text-sm">AI 改善提案 (Claude)</span>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{text}</p>
    </div>
  )
}

function FinOpsResult({ result }: { result: Record<string, unknown> }) {
  const summary = result.summary as Record<string, unknown> | undefined
  const topServices = (result.top_services as Array<Record<string, unknown>>) ?? []
  const recommendations = (result.recommendations as string[]) ?? []
  const aiSuggestions = result.ai_suggestions as string | undefined

  return (
    <div>
      {summary && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">集計期間</div>
            <div className="text-sm font-medium">{String(summary.period ?? "")}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">合計コスト</div>
            <div className="text-xl font-bold text-gray-900">
              ${Number(summary.total_cost ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {topServices.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">サービス別コスト</h3>
          <div className="space-y-2">
            {topServices.map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-20 font-medium">{String(s.service)}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${Number(s.pct)}%` }}
                  />
                </div>
                <span className="w-20 text-right text-gray-600">
                  ${Number(s.cost).toLocaleString()}
                </span>
                <span className="w-12 text-right text-gray-400">{Number(s.pct).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">削減推奨事項</h3>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-blue-500 shrink-0">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AiSuggestions text={aiSuggestions ?? ""} />
    </div>
  )
}

function CloudGuardResult({ result }: { result: Record<string, unknown> }) {
  const findings = (result.findings as Array<Record<string, unknown>>) ?? []
  const aiSuggestions = result.ai_suggestions as string | undefined

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "検出総数", value: result.total, color: "text-gray-900" },
          { label: "CRITICAL", value: result.critical, color: "text-red-600" },
          { label: "HIGH", value: result.high, color: "text-orange-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{String(value ?? 0)}</div>
          </div>
        ))}
      </div>

      {findings.length > 0 && (
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">検出事項</h3>
          <div className="space-y-2">
            {findings.map((f, i) => (
              <div key={i} className="flex items-start gap-3 text-sm bg-gray-50 rounded-lg p-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${SEVERITY_COLOR[String(f.severity)] ?? "bg-gray-100"}`}>
                  {String(f.severity)}
                </span>
                <div>
                  <div className="font-medium">{String(f.rule)}</div>
                  <div className="text-gray-500 text-xs">{String(f.resource)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AiSuggestions text={aiSuggestions ?? ""} />
    </div>
  )
}

function ScoreResult({ result }: { result: Record<string, unknown> }) {
  const breakdown = result.breakdown as Record<string, Record<string, unknown>> | undefined
  const aiSuggestions = result.ai_suggestions as string | undefined
  const grade = String(result.grade ?? "")
  const score = Number(result.score ?? 0)
  const level = result.level as string | undefined

  const AXIS_LABELS: Record<string, string> = {
    availability: "可用性",
    performance: "パフォーマンス",
    security: "セキュリティ",
    cost_efficiency: "コスト効率",
    identity: "ID・認証",
    device: "デバイス管理",
    application: "アプリケーション",
    network: "ネットワーク",
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">{score}</div>
          <div className="text-xs text-gray-400 mt-1">/ 100</div>
        </div>
        <div>
          <span className={`px-4 py-2 rounded-xl text-2xl font-bold ${GRADE_COLOR[grade] ?? "bg-gray-100"}`}>
            {grade}
          </span>
          {level && <div className="text-sm text-gray-500 mt-2">{level}</div>}
        </div>
      </div>

      {breakdown && (
        <div className="space-y-3 mb-4">
          {Object.entries(breakdown).map(([key, axis]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{AXIS_LABELS[key] ?? key}</span>
                <span>重み {Math.round(Number(axis.weight ?? 0) * 100)}%</span>
              </div>
              <ScoreBar score={Number(axis.score ?? 0)} />
            </div>
          ))}
        </div>
      )}

      <AiSuggestions text={aiSuggestions ?? ""} />
    </div>
  )
}

function SupplyGuardResult({ result }: { result: Record<string, unknown> }) {
  const vendors = (result.vendors as Array<Record<string, unknown>>) ?? []
  const aiSuggestions = result.ai_suggestions as string | undefined

  return (
    <div>
      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">ベンダー名</th>
              <th className="px-3 py-2 text-center">グレード</th>
              <th className="px-3 py-2 text-center">総合</th>
              <th className="px-3 py-2 text-center">SBOM/CVE</th>
              <th className="px-3 py-2 text-center">アンケート</th>
              <th className="px-3 py-2 text-center">インシデント</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.map((v, i) => {
              const grade = String(v.grade ?? "")
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium">{String(v.name)}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-xs ${GRADE_COLOR[grade] ?? "bg-gray-100"}`}>
                      {grade}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center font-medium">{String(v.score)}</td>
                  <td className="px-3 py-3 text-center text-gray-600">{String(v.sbom ?? "-")}</td>
                  <td className="px-3 py-3 text-center text-gray-600">{String(v.questionnaire ?? "-")}</td>
                  <td className="px-3 py-3 text-center text-gray-600">{String(v.incident ?? "-")}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <AiSuggestions text={aiSuggestions ?? ""} />
    </div>
  )
}

export function ScanResultRenderer({ product, result }: Props) {
  switch (product) {
    case "finops":
      return <FinOpsResult result={result} />
    case "cloudguard":
      return <CloudGuardResult result={result} />
    case "infrascore":
      return <ScoreResult result={result} />
    case "zerovis":
      return <ScoreResult result={result} />
    case "supplyguard":
      return <SupplyGuardResult result={result} />
    default:
      return (
        <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-auto max-h-96 text-gray-700">
          {JSON.stringify(result, null, 2)}
        </pre>
      )
  }
}
