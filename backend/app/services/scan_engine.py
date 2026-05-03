"""CLI エンジンを SaaS API から呼び出すアダプター層"""
import sys
from pathlib import Path

FINOPS_CLI_PATH = Path(__file__).parent.parent.parent.parent.parent / "finops-cli"
CLOUDGUARD_CLI_PATH = Path(__file__).parent.parent.parent.parent.parent / "cloudguard-cli"
INFRASCORE_CLI_PATH = Path(__file__).parent.parent.parent.parent.parent / "infrascore-cli"
SUPPLYGUARD_CLI_PATH = Path(__file__).parent.parent.parent.parent.parent / "supplyguard-cli"
ZEROVIS_CLI_PATH = Path(__file__).parent.parent.parent.parent.parent / "zerovis-cli"


def _add_cli_path(path: Path):
    s = str(path)
    if s not in sys.path:
        sys.path.insert(0, s)


def run_finops_scan(role_arn: str | None = None, demo: bool = False) -> dict:
    _add_cli_path(FINOPS_CLI_PATH)
    try:
        from demo_data import get_demo_data  # type: ignore
        from analyzer import CostAnalyzer    # type: ignore
        data = get_demo_data()
        analyzer = CostAnalyzer(data)
        analysis = analyzer.analyze()
        result = {
            "summary": analysis.get("summary", {}),
            "top_services": analysis.get("top_services", []),
            "recommendations": analysis.get("recommendations", []),
        }
    except Exception as e:
        result = _finops_demo_fallback()

    from app.services.ai_advisor import get_ai_suggestions
    result["ai_suggestions"] = get_ai_suggestions("finops", result)
    return result


def run_cloudguard_scan(role_arn: str | None = None, demo: bool = False) -> dict:
    _add_cli_path(CLOUDGUARD_CLI_PATH)
    try:
        from demo_data import get_demo_findings  # type: ignore
        findings = get_demo_findings()
        result = {
            "total": len(findings),
            "critical": sum(1 for f in findings if f.get("severity") == "CRITICAL"),
            "high": sum(1 for f in findings if f.get("severity") == "HIGH"),
            "findings": findings[:10],
        }
    except Exception:
        result = _cloudguard_demo_fallback()

    from app.services.ai_advisor import get_ai_suggestions
    result["ai_suggestions"] = get_ai_suggestions("cloudguard", result)
    return result


def run_infrascore_scan(role_arn: str | None = None, demo: bool = False) -> dict:
    result = {
        "score": 74,
        "grade": "C",
        "breakdown": {
            "availability": {"score": 68, "weight": 0.35},
            "performance": {"score": 82, "weight": 0.25},
            "security": {"score": 71, "weight": 0.25},
            "cost_efficiency": {"score": 79, "weight": 0.15},
        },
        "demo": True,
    }
    from app.services.ai_advisor import get_ai_suggestions
    result["ai_suggestions"] = get_ai_suggestions("infrascore", result)
    return result


def run_supplyguard_scan(role_arn: str | None = None, demo: bool = False) -> dict:
    result = {
        "vendors": [
            {"name": "Alpha製造株式会社", "grade": "B", "score": 76, "sbom": 55, "questionnaire": 89, "incident": 100},
            {"name": "Beta Systems Ltd.", "grade": "S", "score": 96, "sbom": 90, "questionnaire": 100, "incident": 100},
            {"name": "Gamma Tech Partners", "grade": "D", "score": 56, "sbom": 70, "questionnaire": 52, "incident": 30},
        ],
        "demo": True,
    }
    from app.services.ai_advisor import get_ai_suggestions
    result["ai_suggestions"] = get_ai_suggestions("supplyguard", result)
    return result


def run_zerovis_scan(role_arn: str | None = None, demo: bool = False) -> dict:
    result = {
        "score": 62,
        "grade": "C",
        "level": "Level 2: 管理段階",
        "breakdown": {
            "identity": {"score": 58, "weight": 0.35},
            "device": {"score": 71, "weight": 0.25},
            "application": {"score": 65, "weight": 0.25},
            "network": {"score": 53, "weight": 0.15},
        },
        "demo": True,
    }
    from app.services.ai_advisor import get_ai_suggestions
    result["ai_suggestions"] = get_ai_suggestions("zerovis", result)
    return result


def _finops_demo_fallback() -> dict:
    return {
        "summary": {"total_cost": 4832.10, "period": "2026-04-01〜2026-04-30"},
        "top_services": [
            {"service": "EC2", "cost": 2104.50, "pct": 43.6},
            {"service": "RDS", "cost": 1203.20, "pct": 24.9},
            {"service": "S3",  "cost":  389.00, "pct":  8.1},
        ],
        "recommendations": ["RI購入でEC2コスト最大72%削減", "未使用EBSの削除"],
    }


def _cloudguard_demo_fallback() -> dict:
    return {
        "total": 7, "critical": 2, "high": 3,
        "findings": [
            {"rule": "S3_PUBLIC_BUCKET", "severity": "CRITICAL", "resource": "my-data-bucket"},
            {"rule": "IAM_NO_MFA",       "severity": "CRITICAL", "resource": "admin-user"},
            {"rule": "SG_OPEN_SSH",      "severity": "HIGH",     "resource": "sg-12345"},
        ],
    }


SCAN_RUNNERS = {
    "finops":      run_finops_scan,
    "cloudguard":  run_cloudguard_scan,
    "infrascore":  run_infrascore_scan,
    "supplyguard": run_supplyguard_scan,
    "zerovis":     run_zerovis_scan,
}


def run_scan(product: str, role_arn: str | None = None, demo: bool = True) -> dict:
    runner = SCAN_RUNNERS.get(product)
    if not runner:
        return {"error": f"Unknown product: {product}"}
    return runner(role_arn=role_arn, demo=demo)
