"""report_generator のユニットテスト"""
import sys
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.report_generator import generate_markdown_report


CREATED_AT = datetime(2026, 5, 4, 12, 0, 0, tzinfo=timezone.utc)

FINOPS_RESULT = {
    "summary": {"total_cost": 4832.10, "period": "2026-04-01〜2026-04-30"},
    "top_services": [
        {"service": "EC2", "cost": 2104.50, "pct": 43.6},
        {"service": "RDS", "cost": 1203.20, "pct": 24.9},
    ],
    "recommendations": ["RI購入でEC2コスト最大72%削減"],
    "ai_suggestions": "EC2コストが全体の43%を占めています。",
}

CLOUDGUARD_RESULT = {
    "total": 5, "critical": 2, "high": 3,
    "findings": [
        {"rule": "S3_PUBLIC_BUCKET", "severity": "CRITICAL", "resource": "my-bucket"},
    ],
    "ai_suggestions": "S3バケットを即座に非公開にしてください。",
}

SCORE_RESULT = {
    "score": 74, "grade": "C",
    "breakdown": {
        "availability": {"score": 68, "weight": 0.35},
        "performance": {"score": 82, "weight": 0.25},
    },
    "ai_suggestions": "可用性の改善が最優先です。",
}

SUPPLYGUARD_RESULT = {
    "vendors": [
        {"name": "Alpha製造", "grade": "B", "score": 76, "sbom": 55, "questionnaire": 89, "incident": 100},
        {"name": "Gamma Tech", "grade": "D", "score": 56, "sbom": 70, "questionnaire": 52, "incident": 30},
    ],
    "ai_suggestions": "Gamma Techのリスクが高いです。",
}


def test_finops_report_contains_total_cost():
    md = generate_markdown_report("finops", FINOPS_RESULT, CREATED_AT)
    assert "4,832.10" in md
    assert "EC2" in md
    assert "RI購入" in md


def test_finops_report_contains_ai_suggestions():
    md = generate_markdown_report("finops", FINOPS_RESULT, CREATED_AT)
    assert "AI 改善提案" in md
    assert "EC2コストが全体" in md


def test_cloudguard_report_contains_severity_summary():
    md = generate_markdown_report("cloudguard", CLOUDGUARD_RESULT, CREATED_AT)
    assert "CRITICAL" in md
    assert "S3_PUBLIC_BUCKET" in md
    assert "my-bucket" in md


def test_score_report_contains_grade():
    md = generate_markdown_report("infrascore", SCORE_RESULT, CREATED_AT)
    assert "74" in md
    assert "グレード**: C" in md
    assert "可用性" in md


def test_zerovis_report_uses_same_score_template():
    md = generate_markdown_report("zerovis", SCORE_RESULT, CREATED_AT)
    assert "ZeroVis JP" in md
    assert "74" in md


def test_supplyguard_report_contains_vendor_table():
    md = generate_markdown_report("supplyguard", SUPPLYGUARD_RESULT, CREATED_AT)
    assert "Alpha製造" in md
    assert "Gamma Tech" in md
    assert "| D |" in md


def test_report_header_contains_date():
    md = generate_markdown_report("finops", FINOPS_RESULT, CREATED_AT)
    assert "2026年05月04日" in md


def test_report_filename_format():
    md = generate_markdown_report("cloudguard", CLOUDGUARD_RESULT, CREATED_AT)
    assert "CloudGuard JP" in md
