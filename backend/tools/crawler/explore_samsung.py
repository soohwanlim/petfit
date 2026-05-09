#!/usr/bin/env python3
"""
DOM explorer for 삼성화재 착한펫보험(파밀리) pages.
Finds candidate selectors for product name, coverage ratio, riders,
and waiting period on direct.samsungfire.com/mall/PP030705_001.html
"""
import json
import os
import sys
from playwright.sync_api import sync_playwright

OUTPUT_DIR = "/home/swtee0506/petfit/backend/tools/output"

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)
WAIT_MS = 10000

ENTRY_URLS = [
    "https://direct.samsungfire.com/mall/PP030705_001.html",
]

# Selectors already in crawl.py — verify these hit real content
CURRENT_SELECTORS = {
    "product_name": ["h2", "title"],
    "coverage_ratio": [".sec-tit-area p.txt", ".sec-tit-area .txt"],
    "riders": [".icon-list p.txt", ".icon-list .txt"],
    "waiting_period": [".bul-round li", ".ui-acco-pnl li"],
}

# Additional Samsung-specific candidates to probe
EXTRA_CANDIDATES = {
    "product_name": [
        "h1", "h2", "h3", "title",
        ".tit", ".prod-tit", ".prd-tit", ".product-name",
        "[class*='tit']", "[class*='title']", "[class*='name']",
        ".sec-tit-area", ".sec-tit-area *",
    ],
    "coverage_ratio": [
        ".sec-tit-area p.txt", ".sec-tit-area .txt", ".sec-tit-area",
        "[class*='ratio']", "[class*='rate']", "[class*='coverage']",
        "[class*='보상']", "[class*='비율']", "[class*='percent']",
        "strong", ".txt", ".desc", "p.txt",
    ],
    "riders": [
        ".icon-list p.txt", ".icon-list .txt", ".icon-list li",
        ".icon-list", "[class*='icon']",
        ".benefit li", ".benefit-item", ".rider", ".rider-list li",
        ".coverage li", ".guarantee li", ".item-list li",
        "[class*='benefit']", "[class*='rider']", "[class*='특약']",
        "[class*='보장']", "table th", "table td",
        ".plan-list li", ".type-list li", ".sec-list li",
    ],
    "waiting_period": [
        ".bul-round li", ".ui-acco-pnl li", ".ui-acco-pnl",
        "[class*='wait']", "[class*='대기']", "[class*='면책']",
        "[class*='caution']", "[class*='notice']", "[class*='note']",
        ".caution li", ".notice li", ".note li", ".info li",
        "[class*='bul']", ".bul-list li", ".bul li",
        ".txt-list li", ".list-type li",
    ],
}


def explore_page(page, url: str) -> dict:
    result = {
        "url": url,
        "title": None,
        "final_url": None,
        "headings": [],
        "tables": [],
        "lists": [],
        "current_selector_hits": {},
        "extra_candidates": {},
        "all_classes": [],
        "body_text_preview": "",
    }

    try:
        page.goto(url, wait_until="networkidle", timeout=30000)
    except Exception:
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
        except Exception as exc:
            result["error"] = str(exc)
            return result

    page.wait_for_timeout(WAIT_MS)
    result["title"] = page.title()
    result["final_url"] = page.url

    # headings
    for tag in ["h1", "h2", "h3", "h4"]:
        for el in page.query_selector_all(tag):
            t = el.inner_text().strip()
            if t:
                result["headings"].append({"tag": tag, "text": t[:150]})

    # tables
    for i, tbl in enumerate(page.query_selector_all("table")[:15]):
        ths = [th.inner_text().strip() for th in tbl.query_selector_all("th") if th.inner_text().strip()]
        tds = [td.inner_text().strip() for td in tbl.query_selector_all("td") if td.inner_text().strip()]
        if ths or tds:
            result["tables"].append({"index": i, "headers": ths[:10], "first_cells": tds[:10]})

    # lists
    for sel in ["ul li", "ol li", ".bul-round li", ".icon-list li",
                ".benefit li", ".guarantee li", ".ui-acco-pnl li"]:
        items = page.query_selector_all(sel)
        texts = [el.inner_text().strip() for el in items if el.inner_text().strip()]
        if texts:
            result["lists"].append({"selector": sel, "count": len(texts), "sample": texts[:6]})

    # verify current crawl.py selectors
    for field, sels in CURRENT_SELECTORS.items():
        hits = []
        for sel in sels:
            try:
                els = page.query_selector_all(sel)
                texts = [e.inner_text().strip()[:120] for e in els if e.inner_text().strip()]
                if texts:
                    hits.append({"selector": sel, "count": len(texts), "texts": texts[:5]})
            except Exception:
                pass
        result["current_selector_hits"][field] = hits

    # probe extra candidates
    for field, sels in EXTRA_CANDIDATES.items():
        hits = []
        for sel in sels:
            try:
                els = page.query_selector_all(sel)
                texts = [e.inner_text().strip()[:120] for e in els if e.inner_text().strip()]
                if texts:
                    hits.append({"selector": sel, "count": len(texts), "texts": texts[:4]})
            except Exception:
                pass
        result["extra_candidates"][field] = hits

    # all CSS classes
    try:
        classes = page.evaluate("""
            () => {
                const seen = new Set();
                document.querySelectorAll('[class]').forEach(el => {
                    el.className.toString().split(/\\s+/).forEach(c => { if (c) seen.add(c); });
                });
                return [...seen].sort();
            }
        """)
        result["all_classes"] = classes
    except Exception:
        pass

    # body text preview
    try:
        result["body_text_preview"] = (page.inner_text("body") or "")[:5000]
    except Exception:
        pass

    return result


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        ctx = browser.new_context(
            user_agent=UA,
            locale="ko-KR",
            viewport={"width": 1280, "height": 900},
        )
        page = ctx.new_page()

        all_results = []

        for url in ENTRY_URLS:
            print(f"\n{'='*70}", file=sys.stderr)
            print(f"Exploring: {url}", file=sys.stderr)

            data = explore_page(page, url)
            all_results.append(data)

            print(f"  Title:     {data['title']}", file=sys.stderr)
            print(f"  Final URL: {data['final_url']}", file=sys.stderr)
            print(f"  Headings:  {[h['text'] for h in data['headings'][:6]]}", file=sys.stderr)
            print(f"  Tables:    {len(data['tables'])}", file=sys.stderr)

            print("\n  --- Current crawl.py selector hits ---", file=sys.stderr)
            for field, hits in data["current_selector_hits"].items():
                if hits:
                    print(f"  [OK] {field}", file=sys.stderr)
                    for h in hits[:2]:
                        print(f"       {h['selector']} ({h['count']}) → {h['texts'][:3]}", file=sys.stderr)
                else:
                    print(f"  [MISS] {field} — no hit", file=sys.stderr)

            print("\n  --- Extra candidate hits ---", file=sys.stderr)
            for field, hits in data["extra_candidates"].items():
                if hits:
                    print(f"  [{field}]", file=sys.stderr)
                    for h in hits[:4]:
                        print(f"    {h['selector']} ({h['count']}) → {h['texts'][:2]}", file=sys.stderr)

            print("\n  --- Body text preview (first 800 chars) ---", file=sys.stderr)
            print(data["body_text_preview"][:800], file=sys.stderr)

            safe = url.split("//")[-1].replace("/", "_")[:50]
            out_path = os.path.join(OUTPUT_DIR, f"dom_samsung_{safe}.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"\n  Saved → {out_path}", file=sys.stderr)

        browser.close()

    summary_path = os.path.join(OUTPUT_DIR, "dom_samsung_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"\n[done] Summary → {summary_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
