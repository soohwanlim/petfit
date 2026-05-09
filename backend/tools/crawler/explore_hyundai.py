#!/usr/bin/env python3
"""
DOM explorer for 현대해상 굿앤굿 펫보험 pages.
Finds the correct pet insurance URL and candidate selectors for
product name, coverage ratio, riders, and waiting period.
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
WAIT_MS = 8000

# Candidate entry points for 현대해상 pet insurance
ENTRY_URLS = [
    "https://www.hi.co.kr/product/pet/repet/overview.do",
    "https://direct.hi.co.kr/service.do?m=pet",
    "https://www.hi.co.kr/product/pet/",
    "https://direct.hi.co.kr/",
]


def explore_page(page, url: str, label: str) -> dict:
    result = {
        "url": url,
        "label": label,
        "title": None,
        "final_url": None,
        "headings": [],
        "tables": [],
        "lists": [],
        "links_with_pet": [],
        "candidates": {},
        "body_text_preview": "",
        "all_classes": [],
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

    # --- headings ---
    for tag in ["h1", "h2", "h3"]:
        for el in page.query_selector_all(tag):
            t = el.inner_text().strip()
            if t:
                result["headings"].append({"tag": tag, "text": t[:120]})

    # --- links mentioning pet / 반려 / 펫 ---
    for el in page.query_selector_all("a"):
        try:
            txt = el.inner_text().strip()
            href = el.get_attribute("href") or ""
            if any(kw in txt.lower() + href.lower() for kw in ["pet", "펫", "반려", "동물"]):
                result["links_with_pet"].append({"text": txt[:80], "href": href[:200]})
        except Exception:
            pass

    # --- tables ---
    for i, tbl in enumerate(page.query_selector_all("table")[:12]):
        ths = [th.inner_text().strip() for th in tbl.query_selector_all("th") if th.inner_text().strip()]
        tds = [td.inner_text().strip() for td in tbl.query_selector_all("td") if td.inner_text().strip()]
        if ths or tds:
            result["tables"].append({"index": i, "headers": ths[:10], "first_cells": tds[:10]})

    # --- lists ---
    for sel in ["ul li", "ol li", ".benefit li", ".rider li", ".coverage li", ".plan li"]:
        items = page.query_selector_all(sel)
        texts = [el.inner_text().strip() for el in items if el.inner_text().strip()]
        if texts:
            result["lists"].append({"selector": sel, "count": len(texts), "sample": texts[:5]})

    # --- candidate selectors ---
    candidates = {
        "product_name": [
            "h1", "h2.tit", ".product-title", ".tit", ".prod-tit",
            ".section-title", ".main-title", ".prd-title", ".title",
            "[class*='prod']", "[class*='tit']",
        ],
        "coverage_ratio": [
            ".coverage", ".coverage-ratio", ".compensation", ".rate",
            "[class*='coverage']", "[class*='ratio']", "[class*='rate']",
            "[class*='보상']", "[class*='비율']", "table th",
        ],
        "riders": [
            ".rider", ".rider-list li", ".rider-item", ".special",
            ".benefit-item", "[class*='rider']", "[class*='특약']",
            "[class*='특별약관']", "table td", ".plan-item", ".ins-item",
            ".coverage-item", ".guarantee li",
        ],
        "waiting_period": [
            ".waiting", ".wait-period", "[class*='wait']",
            "[class*='대기']", "[class*='면책']", ".caution li",
            ".note li", ".info li",
        ],
    }
    for field, sels in candidates.items():
        found = []
        for sel in sels:
            try:
                els = page.query_selector_all(sel)
                texts = [e.inner_text().strip()[:100] for e in els if e.inner_text().strip()]
                if texts:
                    found.append({"selector": sel, "count": len(texts), "texts": texts[:4]})
            except Exception:
                pass
        result["candidates"][field] = found

    # --- all classes ---
    try:
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
    except Exception:
        pass

    # --- body text preview ---
    try:
        body_text = page.inner_text("body") or ""
        result["body_text_preview"] = body_text[:4000]
    except Exception:
        pass

    return result


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        ctx = browser.new_context(user_agent=UA, locale="ko-KR", viewport={"width": 1280, "height": 900})
        page = ctx.new_page()

        all_results = []

        for url in ENTRY_URLS:
            label = url.split("//")[-1]
            print(f"\n{'='*70}", file=sys.stderr)
            print(f"Exploring: {url}", file=sys.stderr)
            data = explore_page(page, url, label)
            all_results.append(data)

            print(f"  Title:     {data['title']}", file=sys.stderr)
            print(f"  Final URL: {data['final_url']}", file=sys.stderr)
            print(f"  Headings:  {[h['text'] for h in data['headings'][:5]]}", file=sys.stderr)
            print(f"  Pet links: {len(data['links_with_pet'])}", file=sys.stderr)
            for lnk in data["links_with_pet"][:8]:
                print(f"    [{lnk['text']}] → {lnk['href']}", file=sys.stderr)
            print(f"  Tables:    {len(data['tables'])}", file=sys.stderr)

            print("\n  --- Candidate selector hits ---", file=sys.stderr)
            for field, hits in data["candidates"].items():
                if hits:
                    print(f"  [{field}]", file=sys.stderr)
                    for h in hits[:3]:
                        print(f"    {h['selector']} ({h['count']}) → {h['texts'][:2]}", file=sys.stderr)

            print("\n  --- Body text preview (first 600 chars) ---", file=sys.stderr)
            print(data["body_text_preview"][:600], file=sys.stderr)

            # Save individual result
            safe_label = label.replace("/", "_").replace("?", "_").replace("=", "_")
            out_path = os.path.join(OUTPUT_DIR, f"dom_hyundai_{safe_label[:40]}.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"\n  Saved → {out_path}", file=sys.stderr)

        browser.close()

    # Combined summary
    summary_path = os.path.join(OUTPUT_DIR, "dom_hyundai_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"\n[done] Summary → {summary_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
