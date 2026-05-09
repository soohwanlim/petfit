#!/usr/bin/env python3
"""
PDF Parser Tool — extracts structured insurance data from a PDF using Claude API.
Usage: python parse_pdf.py <path/to/insurance.pdf>
Requires: ANTHROPIC_API_KEY env var
"""

import sys
import json
import base64
import os
from pathlib import Path

import anthropic

MODEL = "claude-sonnet-4-20250514"
OUTPUT_DIR = Path(__file__).parent.parent / "output"

EXTRACTION_PROMPT = """Analyze this Korean pet insurance PDF and extract the following information.
Return ONLY a valid JSON object — no markdown, no explanation, no extra text.

Required structure:
{
  "productName": "product name (Korean)",
  "provider": "insurance company name (Korean)",
  "coverageRatio": 0.8,
  "deductible": 100000,
  "monthlyPremium": null,
  "riders": [
    {
      "riderName": "rider name (Korean)",
      "type": "rider category/type",
      "waitingMonths": 3,
      "limitPerClaim": 300000,
      "annualLimit": 1000000,
      "coveredDiseases": ["disease1", "disease2"]
    }
  ]
}

Field rules:
- coverageRatio: decimal (0.7 = 70%, 0.8 = 80%)
- deductible: integer in Korean Won (KRW); null if not found
- monthlyPremium: integer in KRW if stated; null if not found
- waitingMonths: integer waiting period before coverage starts; null if not stated
- limitPerClaim: per-incident limit in KRW; null if not found
- annualLimit: annual total coverage limit in KRW; null if not found
- coveredDiseases: list of disease/condition names; empty list [] if not specified
- Extract ALL riders found in the document
- Use null for any field not present in the document
"""


def load_pdf_as_base64(path: Path) -> str:
    with open(path, "rb") as f:
        return base64.standard_b64encode(f.read()).decode("utf-8")


def extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        # parts[1] is the content between first pair of backticks
        inner = parts[1]
        if inner.startswith("json"):
            inner = inner[4:]
        text = inner.strip()
    return json.loads(text)


def parse_pdf(pdf_path: Path) -> dict:
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    print(f"[parse_pdf] Loading {pdf_path.name} ({pdf_path.stat().st_size // 1024} KB)", file=sys.stderr)
    pdf_b64 = load_pdf_as_base64(pdf_path)

    client = anthropic.Anthropic()

    print(f"[parse_pdf] Sending to Claude ({MODEL})…", file=sys.stderr)
    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": EXTRACTION_PROMPT,
                    },
                ],
            }
        ],
    )

    raw = response.content[0].text
    return extract_json(raw)


def safe_filename(name: str) -> str:
    return "".join(c if c.isalnum() or c in "-_" else "_" for c in name)


def main():
    if len(sys.argv) < 2:
        print("Usage: python parse_pdf.py <path/to/insurance.pdf>", file=sys.stderr)
        sys.exit(1)

    pdf_path = Path(sys.argv[1])

    result = parse_pdf(pdf_path)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    provider_raw = result.get("provider") or pdf_path.stem
    output_file = OUTPUT_DIR / f"{safe_filename(provider_raw)}.json"

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    print(f"\n[parse_pdf] Saved → {output_file}", file=sys.stderr)


if __name__ == "__main__":
    main()
