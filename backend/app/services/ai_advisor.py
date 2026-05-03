"""Claude AI による日本語削減・改善提案生成"""
import os
from app.core.config import settings


def get_ai_suggestions(product: str, scan_result: dict) -> str:
    """スキャン結果を元に Claude AI が日本語で改善提案を生成"""
    api_key = settings.anthropic_api_key
    if not api_key:
        return _fallback_suggestions(product, scan_result)

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        prompt = _build_prompt(product, scan_result)
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
    except Exception:
        return _fallback_suggestions(product, scan_result)


def _build_prompt(product: str, scan_result: dict) -> str:
    product_names = {
        "finops": "AWSコスト最適化",
        "cloudguard": "AWSセキュリティ監査",
        "infrascore": "AWSインフラ健全性スコアリング",
        "supplyguard": "サプライチェーンセキュリティ評価",
        "zerovis": "ゼロトラスト成熟度評価",
    }
    name = product_names.get(product, product)

    return f"""あなたは{name}の専門家です。以下のスキャン結果を分析し、日本語で優先度の高い改善提案を3〜5件、箇条書きで簡潔に提示してください。

スキャン結果:
{_format_result(scan_result)}

回答は以下の形式で：
【優先度: 高】改善提案の内容（具体的なアクションを含む）
【優先度: 中】...
【優先度: 低】...

技術的に具体的で、日本のエンジニアがすぐに実行できる内容にしてください。"""


def _format_result(result: dict) -> str:
    lines = []
    for k, v in result.items():
        if k == "markdown":
            continue
        if isinstance(v, list):
            lines.append(f"{k}: {len(v)}件")
        elif isinstance(v, dict):
            for kk, vv in v.items():
                lines.append(f"  {kk}: {vv}")
        else:
            lines.append(f"{k}: {v}")
    return "\n".join(lines[:20])


def _fallback_suggestions(product: str, scan_result: dict) -> str:
    """API未設定時のデモ提案"""
    fallbacks = {
        "finops": """【優先度: 高】EC2インスタンスのRI/Savings Plans購入を検討。常時稼働インスタンスに適用で最大72%削減可能。
【優先度: 高】未使用・アイドル状態のEC2インスタンスを特定し、停止または削除。EBSも同様に確認。
【優先度: 中】S3ライフサイクルポリシーを設定し、アクセス頻度の低いデータをIntelligent-Tiering/Glacierに移行。
【優先度: 中】CloudWatchのコストアラートを設定し、予算超過を早期検知できる体制を整備。
【優先度: 低】マルチリージョン構成の見直し。不要なデータ転送コストが発生していないか確認。""",

        "cloudguard": """【優先度: 高】CRITICAL/HIGH の脆弱性を今週中に対処。特にPublic S3バケット・広範なセキュリティグループを最優先。
【優先度: 高】MFAを全IAMユーザー（特に管理者権限）に強制適用。AWS Organizations SCP で制御推奨。
【優先度: 中】CloudTrailをすべてのリージョンで有効化し、S3に90日以上保存。インシデント時の追跡に必須。
【優先度: 中】使用していないIAMユーザー・アクセスキーを無効化。Access Analyzer で定期レビューを実施。
【優先度: 低】Security Hub を有効化し、CIS AWS Foundations Benchmark への準拠状況を自動チェック。""",

        "infrascore": """【優先度: 高】CloudWatchアラートが未設定のリソースに緊急度の高いメトリクスアラームを追加。
【優先度: 高】CPU使用率90%超のインスタンスをスケールアップ、または Auto Scaling Group でスケールアウト設定。
【優先度: 中】ELBの5xxエラー率が高い場合、ターゲットグループのヘルスチェック設定とアプリログを確認。
【優先度: 中】RDSの自動バックアップ保持期間を7日以上に設定。Multi-AZ構成も検討。
【優先度: 低】アイドル状態のEC2・未アタッチEBSをRIレポートと照合し、不要リソースをクリーンアップ。""",

        "supplyguard": """【優先度: 高】SBOMを提出していないベンダーに2週間以内の提出を要求。EU CRA（2027年施行）対応のため必須。
【優先度: 高】CRITICAL CVEが検出されたベンダーに対し、パッチ適用スケジュールの提出を求め追跡管理。
【優先度: 中】セキュリティアンケート回答率が低いベンダーとの契約更新時にSLA条項を見直し。
【優先度: 中】インシデント履歴があるベンダーの代替候補を選定し、BCP計画に組み込む。
【優先度: 低】四半期ごとのベンダーリスクレビュー会議を設定し、スコア変動を定期モニタリング。""",

        "zerovis": """【優先度: 高】MFAカバレッジが低い場合、Entra ID / Okta / AWS IAM Identity Center でMFAポリシーを即時強制。
【優先度: 高】MDM未管理デバイスを特定し、Microsoft Intune / Jamf でポリシー適用範囲を拡大。
【優先度: 中】VPN依存度を下げるため、ZTNA（Zscaler Private Access等）の段階的導入を検討。
【優先度: 中】シャドーITの棚卸しを実施。Defender for Cloud Apps等でSaaS利用状況を可視化。
【優先度: 低】NISC サイバーセキュリティ対策基準への対応状況をチェックリストで確認し、ギャップを記録。""",
    }
    return fallbacks.get(product, "AIによる改善提案を生成するには ANTHROPIC_API_KEY を設定してください。")
