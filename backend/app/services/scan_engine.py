"""CLI エンジンを SaaS API から呼び出すアダプター層"""
import sys
import os
from pathlib import Path


FINOPS_CLI_PATH = Path(__file__).parent.parent.parent.parent.parent / "finops-cli"
CLOUDGUARD_CLI_PATH = Path(__file__).parent.parent.parent.parent.parent / "cloudguard-cli"


def _add_cli_path(path: Path):
    s = str(path)
    if s not in sys.path:
        sys.path.insert(0, s)


def run_finops_scan(role_arn: str | None = None, demo: bool = False) -> dict:
    _add_cli_path(FINOPS_CLI_PATH)
    from demo_data import get_demo_data
    from analyzer import CostAnalyzer
    from report import ReportGenerator

    data = get_demo_data()
    analyzer = CostAnalyzer(data)
    analysis = analyzer.analyze()
    report = ReportGenerator(analysis)
    return {
        "summary": analysis.get("summary", {}),
        "top_services": analysis.get("top_services", []),
        "recommendations": analysis.get("recommendations", []),
        "markdown": report.to_markdown() if hasattr(report, "to_markdown") else "",
    }


def run_cloudguard_scan(role_arn: str | None = None, demo: bool = False) -> dict:
    _add_cli_path(CLOUDGUARD_CLI_PATH)
    from demo_data import get_demo_findings  # type: ignore
    findings = get_demo_findings()
    return {
        "total": len(findings),
        "critical": sum(1 for f in findings if f.get("severity") == "CRITICAL"),
        "high": sum(1 for f in findings if f.get("severity") == "HIGH"),
        "findings": findings,
    }


SCAN_RUNNERS = {
    "finops": run_finops_scan,
    "cloudguard": run_cloudguard_scan,
}


def run_scan(product: str, role_arn: str | None = None, demo: bool = True) -> dict:
    runner = SCAN_RUNNERS.get(product)
    if not runner:
        return {"error": f"Unknown product: {product}"}
    return runner(role_arn=role_arn, demo=demo)
