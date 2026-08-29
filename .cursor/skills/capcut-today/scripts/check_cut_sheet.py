#!/usr/bin/env python3
"""Validate a CapCut-today cut sheet JSON against the locked numbers."""

from __future__ import annotations

import json
import sys
from pathlib import Path

CUT_SEC = 1.5
MIN_SCENES = 6
MAX_SCENES = 8
MAX_LEN = 12.0


def check(data: dict) -> list[str]:
    errors: list[str] = []
    variable = str(data.get("variable") or "").strip()
    if not variable:
        errors.append("variable empty — use 확인 필요 if unknown")

    cuts = data.get("cuts")
    if not isinstance(cuts, list):
        errors.append("cuts must be a list")
        return errors

    n = len(cuts)
    if n < MIN_SCENES or n > MAX_SCENES:
        errors.append(f"scenes {n} not in 6–8")

    total = 0.0
    for i, cut in enumerate(cuts, 1):
        if not isinstance(cut, dict):
            errors.append(f"cut {i} is not an object")
            continue
        try:
            sec = float(cut.get("sec"))
        except (TypeError, ValueError):
            errors.append(f"cut {i} missing sec")
            continue
        if abs(sec - CUT_SEC) > 1e-9:
            errors.append(f"cut {i} is {sec}s, not 1.5")
        see = str(cut.get("see") or "").strip()
        if not see:
            errors.append(f"cut {i} has empty see")
        total += sec

    if total - MAX_LEN > 1e-9:
        errors.append(f"total {total}s > 12")

    line = str(data.get("line") or "").strip()
    exit_line = str(data.get("exit") or "").strip()
    if not line:
        errors.append("missing 글 (line)")
    if line and exit_line and line == exit_line:
        errors.append("말 and 글 are the same line")
    return errors


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: check_cut_sheet.py <sheet.json>", file=sys.stderr)
        return 2
    path = Path(argv[1])
    data = json.loads(path.read_text(encoding="utf-8"))
    errors = check(data)
    if errors:
        print("FAIL")
        for e in errors:
            print(f"- {e}")
        return 1
    cuts = data["cuts"]
    total = sum(float(c["sec"]) for c in cuts)
    print(f"OK {len(cuts)} × 1.5 = {total}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
