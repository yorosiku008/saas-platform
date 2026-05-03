"""テスト実行ヘルパー - sys.path を設定してから pytest を実行"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
import pytest

if __name__ == "__main__":
    sys.exit(pytest.main(["tests/", "-v"] + sys.argv[1:]))
