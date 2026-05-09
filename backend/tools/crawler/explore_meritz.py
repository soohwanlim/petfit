#!/usr/bin/env python3
"""
DOM explorer for 메리츠 펫퍼민트 pages.
Prints tag structure, visible text snippets, and candidate selectors for
product name, coverage ratio, riders, and waiting period.
"""
import json
import sys
from playwright.sync_api import sync_playwright

URLS = [
    "https://www.meritzfire.com/insurance/pet/petpeppermint/overview.do",
    "https://www.meritzfire.com/insurance/pet/petpeppermint/clause.do",
]

WAIT_MS = 8000  # give JS time to render


def explore(url: str) -> dict:
    result = {"url": url, "title": None, "headings": [], "tables": [], "lists": [], "candidates": {}}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="ko-KR",
        )
        page = ctx.new_page()
        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
        except Exception:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(WAIT_MS)

        result["title"] = page.title()

        # --- headings ---
        for tag in ["h1", "h2", "h3"]:
            els = page.query_selector_all(tag)
            for el in els:
                t = el.inner_text().strip()
                if t:
                    result["headings"].append({"tag": tag, "text": t[:120]})

        # --- tables: capture headers + first row ---
        tables = page.query_selector_all("table")
        for i, tbl in enumerate(tables[:10]):
            ths = [th.inner_text().strip() for th in tbl.query_selector_all("th") if th.inner_text().strip()]
            tds = [td.inner_text().strip() for td in tbl.query_selector_all("td") if td.inner_text().strip()]
            if ths or tds:
                result["tables"].append({"index": i, "headers": ths[:10], "first_cells": tds[:10]})

        # --- lists ---
        for sel in ["ul li", "ol li", ".benefit li", ".rider li", ".coverage li"]:
            items = page.query_selector_all(sel)
            texts = [el.inner_text().strip() for el in items if el.inner_text().strip()]
            if texts:
                result["lists"].append({"selector": sel, "count": len(texts), "sample": texts[:5]})

        # --- candidate selectors for key data ---
        candidates = {
            "product_name": [
                "h1", "h2.tit", ".product-title", ".tit", ".prod-tit",
                ".section-title", ".main-title", ".prd-title",
            ],
            "coverage_ratio": [
                ".coverage", ".coverage-ratio", ".compensation",
                "[class*='coverage']", "[class*='ratio']", "[class*='rate']",
                "[class*='보상']",
            ],
            "riders": [
                ".rider", ".rider-list li", ".rider-item",
                ".benefit-item", "[class*='rider']", "[class*='특약']",
                "table.coverage td", ".plan-item", ".ins-item",
            ],
            "waiting_period": [
                ".waiting", ".wating-period", ".wait",
                "[class*='wait']", "[class*='대기']", "[class*='면책']",
            ],
        }
        for field, sels in candidates.items():
            found = []
            for sel in sels:
                try:
                    els = page.query_selector_all(sel)
                    texts = [e.inner_text().strip()[:100] for e in els if e.inner_text().strip()]
                    if texts:
                        found.append({"selector": sel, "count": len(texts), "texts": texts[:3]})
                except Exception:
                    pass
            result["candidates"][field] = found

        # --- dump all class names on visible elements (for pattern discovery) ---
        classes = page.evaluate("""
            () => {
                const seen = new Set();
                document.querySelectorAll('[class]').forEach(el => {
                    el.className.toString().split(/\\s+/).forEach(c => { if(c) seen.add(c); });
                });
                return [...seen].sort();
            }
        """)
        result["all_classes"] = classes

        # --- full page text (first 3000 chars) ---
        body_text = page.inner_text("body") if page.query_selector("body") else ""
        result["body_text_preview"] = body_text[:3000]

        browser.close()

    return result


def main():
    for url in URLS:
        print(f"\n{'='*70}", file=sys.stderr)
        print(f"Exploring: {url}", file=sys.stderr)
        data = explore(url)
        out_path = f"/home/swtee0506/petfit/backend/tools/output/dom_{data['url'].split('/')[-1].replace('.do','')}.json"
        import os; os.makedirs("/home/swtee0506/petfit/backend/tools/output", exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  Title: {data['title']}", file=sys.stderr)
        print(f"  Headings ({len(data['headings'])}): {[h['text'] for h in data['headings'][:5]]}", file=sys.stderr)
        print(f"  Tables: {len(data['tables'])}", file=sys.stderr)
        print(f"  Saved → {out_path}", file=sys.stderr)

        # Print candidate hits
        print("\n  --- Candidate selector hits ---", file=sys.stderr)
        for field, hits in data["candidates"].items():
            if hits:
                print(f"  [{field}]", file=sys.stderr)
                for h in hits:
                    print(f"    {h['selector']} ({h['count']}) → {h['texts']}", file=sys.stderr)

        print(f"\n  --- Body text preview ---", file=sys.stderr)
        print(data["body_text_preview"][:800], file=sys.stderr)


if __name__ == "__main__":
    main()
