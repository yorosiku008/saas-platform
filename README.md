# FinOps JP SaaS Platform

[![Tests](https://github.com/yorosiku008/saas-platform/actions/workflows/test.yml/badge.svg)](https://github.com/yorosiku008/saas-platform/actions)
[![Beta](https://img.shields.io/badge/β版-募集中-brightgreen)](mailto:yorosiku008@gmail.com)

AWS特化・日本語ネイティブのSaaSプラットフォーム。5製品（FinOps JP / CloudGuard JP / InfraScore JP / SupplyGuard JP / ZeroVis JP）を統合管理。

## アーキテクチャ

```
frontend/   Next.js 14 (App Router + TailwindCSS)
backend/    FastAPI + SQLAlchemy 2.0 async + PostgreSQL
            Stripe課金 / JWT認証 / Celery非同期タスク
```

## ローカル起動

```bash
# 前提: Docker Desktop, Python 3.12, Node.js 18+

# 1. バックエンド
cd backend
cp .env.example .env          # 必要な環境変数を設定
docker-compose up -d db redis
pip install -r requirements.txt aiosqlite email-validator
alembic upgrade head
uvicorn app.main:app --reload  # → http://localhost:8000

# 2. フロントエンド
cd frontend
npm install
npm run dev                    # → http://localhost:3000
```

## API エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/v1/auth/register` | 新規登録（組織作成） |
| POST | `/api/v1/auth/login` | ログイン（JWT発行） |
| GET | `/api/v1/auth/me` | ログインユーザー情報 |
| GET/POST | `/api/v1/aws-connections/` | AWS接続管理 |
| GET/POST | `/api/v1/scans/` | スキャン実行・一覧 |
| GET | `/api/v1/scans/{id}` | スキャン結果詳細 |
| POST | `/api/v1/billing/create-checkout-session` | Stripeチェックアウト |
| POST | `/api/v1/billing/webhook` | Stripe Webhook |
| GET | `/api/v1/billing/current-plan` | 現在のプラン確認 |

## テスト

```bash
cd backend
python run_tests.py -v
# 9 passed
```

## 料金プラン

| プラン | 月額 | スキャン | AI提案 |
|--------|------|----------|--------|
| Free | ¥0 | 3回/月 | なし |
| Starter | ¥5,800 | 30回/月 | 月5回 |
| Pro | ¥14,800 | 無制限 | 無制限 |
| Enterprise | ¥29,800〜 | 無制限 | 無制限+SLA |

**β版特典**: Pro相当3ヶ月無料 / 正式版50%OFF（6ヶ月）

---

*β版ユーザー募集中 → yorosiku008@gmail.com*
