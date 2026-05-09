#!/usr/bin/env python3
"""
Pet Insurance Crawler — scrapes Korean insurer product pages and reports changes.
Targets: 메리츠 펫퍼민트, KB손보 KB펫보험, 현대해상 굿앤굿, 삼성화재 파밀리

Usage: python crawl.py
Output: backend/tools/output/crawl_report_{timestamp}.json
        backend/tools/output/snapshots/{insurer_key}.json  (persisted per run)
"""

import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests
from bs4 import BeautifulSoup

OUTPUT_DIR = Path(__file__).parent.parent / "output"
SNAPSHOT_DIR = OUTPUT_DIR / "snapshots"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
}
TIMEOUT = 20


# ---------------------------------------------------------------------------
# Site configurations
# ---------------------------------------------------------------------------

SITES = [
    {
        "key": "meritz_petpermint",
        "name": "메리츠 펫퍼민트",
        "provider": "메리츠화재",
        # store.meritzfire.com is a JS SPA — requires Playwright rendering.
        # Visit main page first to establish session, then load product page.
        "js_render": True,
        "session_url": "https://store.meritzfire.com/pet/main.do",
        "urls": [
            "https://store.meritzfire.com/pet/product-cat.do#!/",
        ],
        "selectors": {
            "product_name": ["title", "h1", "h2.top_banner", ".prd_top_area h2"],
            # Coverage ratio lives in .guarantee table headers (e.g. "70% 고급형")
            "coverage_ratio": [".guarantee table th", ".bx_table th", "table th"],
            # Rider names are <th> cells in the two coverage tables inside .guarantee
            "riders": [".guarantee table th", ".guarantee table td"],
            "waiting_period": [".guarantee", ".list_type01 li", ".list01 li"],
        },
    },
    {
        "key": "kb_pet",
        "name": "KB손보 KB펫보험",
        "provider": "KB손해보험",
        # direct.kbinsure.co.kr/GL/LPC = cat product; all coverage tables pre-rendered in DOM
        "js_render": True,
        "urls": [
            "https://direct.kbinsure.co.kr/home/#/GL/LPC/LT_CM0101M/",
        ],
        "selectors": {
            "product_name": ["h1", "title", ".product-name"],
            "coverage_ratio": ["table th", "h3", "h4"],
            "riders": ["table th"],
            "waiting_period": ["table td", ".info li", ".caution li"],
        },
    },
    {
        "key": "hyundai_goodngood",
        "name": "현대해상 굿앤굿우리펫보험",
        "provider": "현대해상",
        # Uses a specialized fetcher: loads the enrollment page, evaluates
        # LT.step.getMenuId("1000") to get the dynamic product-info page URL,
        # then scrapes that info page for coverage content.
        # Fallback info-page menu ID: 78ee531539 (cat) — update if site redeploys.
        "custom_fetcher": "hyundai_cat",
        "js_render": True,
        "urls": [],  # populated dynamically by playwright_fetch_hyundai_cat
        "selectors": {
            # Info page h2 is generic; name falls back to site["name"]
            "product_name": [".pt_title span.bold", "h2.pt_title", "h1", "h2"],
            # Coverage ratio not exposed on product-info page
            "coverage_ratio": [".guarantee_list .item h5", ".guarantee_area"],
            # Each <h5> inside a .guarantee_list item is a rider/benefit headline
            "riders": [".guarantee_list .item h5", ".guarantee_list h5"],
            # Each <li> inside .list_depth_ty2 may contain "면책기간 N일"
            "waiting_period": [
                ".guarantee_list .item .list_depth_ty2 li",
                ".guarantee_list .list_depth_ty2 li",
                ".guarantee_area .list_depth_ty2 li",
            ],
        },
    },
    {
        "key": "samsung_famili",
        "name": "삼성화재 착한펫보험",
        "provider": "삼성화재",
        # direct.samsungfire.com/mall/PP030705_001.html = 반려묘(고양이) product page.
        # Riders are in .icon-list p.txt (Point 2 disease icons; always in DOM).
        # Waiting-period notes are in .bul-round li inside accordion panels
        # (display:none in browser but BeautifulSoup still reads them).
        "js_render": True,
        "urls": [
            "https://direct.samsungfire.com/mall/PP030705_001.html",
        ],
        "selectors": {
            # .tit first element is "반려묘보험"; h2 returns nav header first so .tit takes priority
            "product_name": [".tit", "h2", "title"],
            # .sec-tit-area p.txt contains "의료비 보장비율 최대 70%"
            "coverage_ratio": [".sec-tit-area p.txt", ".sec-tit-area .txt"],
            # Each .icon-list p.txt is a cat-specific disease/coverage icon label
            "riders": [".icon-list p.txt", ".icon-list .txt"],
            # .bul-round li holds "30일간 보장 제외됩니다" and coverage notes
            "waiting_period": [".bul-round li", ".ui-acco-pnl li"],
        },
    },
]


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def fetch(url: str) -> Optional[BeautifulSoup]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding or "utf-8"
        return BeautifulSoup(resp.text, "lxml")
    except requests.RequestException as exc:
        print(f"  [WARN] fetch failed for {url}: {exc}", file=sys.stderr)
        return None


def playwright_fetch_hyundai_cat() -> Optional[BeautifulSoup]:
    """
    Fetch 현대해상 굿앤굿우리펫보험(고양이) product info page.

    Loads the cat enrollment entry point, evaluates LT.step.getMenuId("1000")
    to resolve the dynamic product-info page menu ID, then loads that page.
    Falls back to the known menu ID 78ee531539 if JS evaluation fails.
    """
    FALLBACK_INFO_ID = "78ee531539"
    ENROLLMENT_URL = "https://direct.hi.co.kr/service.do?m=108256981a&petType=C"

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("  [WARN] playwright not installed", file=sys.stderr)
        return fetch(f"https://direct.hi.co.kr/service.do?m={FALLBACK_INFO_ID}&petType=C")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
            ctx = browser.new_context(
                user_agent=HEADERS["User-Agent"],
                locale="ko-KR",
                viewport={"width": 1280, "height": 900},
            )
            page = ctx.new_page()

            # Load enrollment page — this bootstraps LT.step with menu definitions
            page.goto(ENROLLMENT_URL, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(12000)

            info_id = page.evaluate("""
                () => {
                    try {
                        return LT && LT.step ? LT.step.getMenuId('1000') : null;
                    } catch (e) { return null; }
                }
            """) or FALLBACK_INFO_ID

            if info_id == FALLBACK_INFO_ID:
                print("  [WARN] JS menuId lookup failed; using fallback", file=sys.stderr)

            info_url = f"https://direct.hi.co.kr/service.do?m={info_id}&petType=C"
            page.goto(info_url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(8000)

            html = page.content()
            browser.close()
        return BeautifulSoup(html, "lxml")
    except Exception as exc:
        print(f"  [WARN] playwright_fetch_hyundai_cat failed: {exc}", file=sys.stderr)
        return None


def playwright_fetch(url: str, session_url: Optional[str] = None) -> Optional[BeautifulSoup]:
    """Fetch a JS-rendered page via headless Chromium."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("  [WARN] playwright not installed; falling back to requests", file=sys.stderr)
        return fetch(url)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
            ctx = browser.new_context(
                user_agent=HEADERS["User-Agent"],
                locale="ko-KR",
                viewport={"width": 1280, "height": 900},
            )
            page = ctx.new_page()
            if session_url:
                page.goto(session_url, wait_until="networkidle", timeout=30000)
                page.wait_for_timeout(2000)
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(6000)
            html = page.content()
            browser.close()
        return BeautifulSoup(html, "lxml")
    except Exception as exc:
        print(f"  [WARN] playwright_fetch failed for {url}: {exc}", file=sys.stderr)
        return None


def page_hash(soup: BeautifulSoup) -> str:
    # Hash the visible text content (strips scripts/styles)
    for tag in soup(["script", "style", "meta", "link"]):
        tag.decompose()
    text = soup.get_text(separator=" ", strip=True)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------------
# Extraction helpers
# ---------------------------------------------------------------------------

def first_text(soup: BeautifulSoup, selectors: list[str]) -> Optional[str]:
    for sel in selectors:
        el = soup.select_one(sel)
        if el:
            return el.get_text(strip=True)
    return None


def all_texts(soup: BeautifulSoup, selectors: list[str]) -> list[str]:
    for sel in selectors:
        els = soup.select(sel)
        if els:
            results = []
            for el in els:
                txt = re.sub(r" {2,}", " ", el.get_text(separator=" ", strip=True))
                if txt:
                    results.append(txt)
            return results
    return []


def extract_coverage_ratio(text: Optional[str]) -> Optional[float]:
    if not text:
        return None
    m = re.search(r"(\d+)\s*%", text)
    if m:
        return int(m.group(1)) / 100
    return None


def extract_waiting_months(text: str) -> Optional[int]:
    m = re.search(r"(\d+)\s*(?:개월|달)", text)
    if m:
        return int(m.group(1))
    return None


def extract_amount_krw(text: str) -> Optional[int]:
    # Handles: 100만원, 1,000,000원, 30만, etc.
    text = text.replace(",", "").replace(" ", "")
    m = re.search(r"(\d+(?:\.\d+)?)\s*만", text)
    if m:
        return int(float(m.group(1)) * 10000)
    m = re.search(r"(\d+)\s*억", text)
    if m:
        return int(m.group(1)) * 100_000_000
    m = re.search(r"(\d+)\s*원", text)
    if m:
        return int(m.group(1))
    return None


_GENERIC_TABLE_HEADERS = {
    # Coverage table column headers
    "보장명", "보장내용", "지급금액", "지급기준", "특약", "기본계약",
    # Enrollment info headers
    "보험기간", "납입기간", "가입나이",
    # Premium example headers
    "납입/보험기간", "합계보험료", "남성", "여성", "구분",
    # Refund/lapse table headers
    "나이", "경과기간", "납입보험료", "납입보험료(원)", "해약환급금",
    "최저보증이율", "평균공시이율", "공시이율", "환급금", "환급률",
    "예상환급금", "예상환급률", "반려동물나이",
    # Renewal table
    "갱신특약(3년만기)",
}


_GENERIC_HEADER_PATTERNS = re.compile(
    r"단위\s*:|^보험료$|^가입금액|^납입보험료$|^합계$|^\d+년$|^\d+세$"
)


def parse_riders(rider_texts: list[str]) -> list[dict]:
    riders = []
    seen: set[str] = set()
    for text in rider_texts:
        if not text or len(text) < 3:
            continue
        if text in _GENERIC_TABLE_HEADERS:
            continue
        if _GENERIC_HEADER_PATTERNS.search(text):
            continue
        key = text[:80]
        if key in seen:
            continue
        seen.add(key)
        rider: dict = {
            "riderName": key,
            "type": None,
            "waitingMonths": extract_waiting_months(text),
            "limitPerClaim": extract_amount_krw(text),
            "annualLimit": None,
            "coveredDiseases": [],
        }
        riders.append(rider)
    return riders


_WAITING_KEYWORDS = re.compile(r"(?:대기|면책|90일|30일|이내.*발병|보장하지\s*않|보장\s*시작)")


def _extract_waiting_notes(soup: BeautifulSoup, selectors: list[str]) -> list[str]:
    """Return sentences that mention waiting periods, deductibles, or exclusions.

    Tries each selector in order. If a selector returns very long text (i.e. a
    container element like .guarantee), splits it into sentences and keeps only
    those matching waiting-period keywords so the result stays concise.
    """
    notes: list[str] = []
    seen: set[str] = set()

    for sel in selectors:
        els = soup.select(sel)
        if not els:
            continue
        for el in els:
            raw = el.get_text(" ", strip=True)
            if not raw:
                continue
            if len(raw) > 200:
                # Container element — split into sentences and filter
                sentences = re.split(r"[.。\n]", raw)
                for s in sentences:
                    s = s.strip()
                    if s and _WAITING_KEYWORDS.search(s) and s not in seen:
                        seen.add(s)
                        notes.append(s[:200])
            else:
                if raw not in seen:
                    seen.add(raw)
                    notes.append(raw[:200])
        if notes:
            break

    return notes[:10]


# ---------------------------------------------------------------------------
# Per-site scrape
# ---------------------------------------------------------------------------

_CUSTOM_FETCHERS = {
    "hyundai_cat": playwright_fetch_hyundai_cat,
}


def scrape_site(site: dict) -> dict:
    name = site["name"]
    print(f"  Scraping {name}…", file=sys.stderr)

    combined_soup = BeautifulSoup("<html><body></body></html>", "lxml")
    hashes: list[str] = []

    custom_fetcher_key = site.get("custom_fetcher")
    if custom_fetcher_key:
        fetcher_fn = _CUSTOM_FETCHERS.get(custom_fetcher_key)
        if fetcher_fn is None:
            print(f"  [WARN] unknown custom_fetcher {custom_fetcher_key!r}", file=sys.stderr)
        else:
            soup = fetcher_fn()
            if soup is not None:
                hashes.append(page_hash(soup))
                for el in soup.body.children if soup.body else []:
                    combined_soup.body.append(el.__copy__() if hasattr(el, "__copy__") else el)
    else:
        use_playwright = site.get("js_render", False)
        session_url = site.get("session_url")

        for url in site["urls"]:
            soup = (
                playwright_fetch(url, session_url=session_url)
                if use_playwright
                else fetch(url)
            )
            if soup is None:
                continue
            hashes.append(page_hash(soup))
            # Merge body content into combined_soup
            for el in soup.body.children if soup.body else []:
                combined_soup.body.append(el.__copy__() if hasattr(el, "__copy__") else el)

    sel = site["selectors"]
    product_name_raw = first_text(combined_soup, sel["product_name"])
    coverage_ratio_raw = first_text(combined_soup, sel["coverage_ratio"])
    rider_texts = all_texts(combined_soup, sel["riders"])
    waiting_raw = _extract_waiting_notes(combined_soup, sel["waiting_period"])

    # Fall back: grep page text for coverage ratio pattern if selector missed or returned no %
    if not coverage_ratio_raw or "%" not in coverage_ratio_raw:
        full_text = combined_soup.get_text(" ", strip=True)
        # Try explicit ratio keywords first, then standalone "N%보장" / "N% 고급형" patterns
        m = re.search(r"(?:보상비율|자기부담금|보상율|보장비율)[^\d]*(\d+)\s*%", full_text)
        if not m:
            m = re.search(r"(\d+)\s*%\s*(?:보장|고급형|기본형|실속형)", full_text)
        if m:
            coverage_ratio_raw = m.group(0)

    combined_hash = hashlib.sha256("".join(hashes).encode()).hexdigest()

    return {
        "key": site["key"],
        "name": name,
        "provider": site["provider"],
        "contentHash": combined_hash,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "extracted": {
            "productName": product_name_raw or site["name"],
            "provider": site["provider"],
            "coverageRatio": extract_coverage_ratio(coverage_ratio_raw),
            "riders": parse_riders(rider_texts),
            "waitingPeriodNotes": waiting_raw[:10],
        },
        "fetchSuccess": len(hashes) > 0,
    }


# ---------------------------------------------------------------------------
# Snapshot / change detection
# ---------------------------------------------------------------------------

def load_snapshot(key: str) -> Optional[dict]:
    path = SNAPSHOT_DIR / f"{key}.json"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return None


def save_snapshot(data: dict) -> None:
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    path = SNAPSHOT_DIR / f"{data['key']}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def detect_changes(current: dict, previous: Optional[dict]) -> dict:
    if previous is None:
        return {"status": "new", "details": "First crawl — no baseline to compare."}

    if current["contentHash"] == previous["contentHash"]:
        return {"status": "unchanged", "details": "Content hash identical."}

    return {
        "status": "changed",
        "details": "Content hash changed since last crawl.",
        "previousHash": previous["contentHash"],
        "previousFetchedAt": previous.get("fetchedAt"),
        "currentHash": current["contentHash"],
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)

    print("[crawler] Starting pet insurance crawl…", file=sys.stderr)

    report_entries = []

    for site in SITES:
        current = scrape_site(site)
        previous = load_snapshot(site["key"])
        change = detect_changes(current, previous)

        save_snapshot(current)

        # Save per-insurer extracted data for downstream consumption
        insurer_file = OUTPUT_DIR / f"{site['key']}.json"
        with open(insurer_file, "w", encoding="utf-8") as f:
            json.dump(current["extracted"], f, ensure_ascii=False, indent=2)

        entry = {
            "insurer": site["name"],
            "provider": site["provider"],
            "change": change,
            "data": current["extracted"],
            "fetchedAt": current["fetchedAt"],
            "fetchSuccess": current["fetchSuccess"],
        }
        report_entries.append(entry)

        status_icon = {"new": "NEW", "unchanged": "—", "changed": "CHANGED"}.get(
            change["status"], "?"
        )
        print(f"  [{status_icon}] {site['name']}", file=sys.stderr)

    report = {
        "reportGeneratedAt": datetime.now(timezone.utc).isoformat(),
        "totalSites": len(SITES),
        "changed": sum(1 for e in report_entries if e["change"]["status"] == "changed"),
        "newSites": sum(1 for e in report_entries if e["change"]["status"] == "new"),
        "unchanged": sum(1 for e in report_entries if e["change"]["status"] == "unchanged"),
        "fetchFailures": sum(1 for e in report_entries if not e["fetchSuccess"]),
        "results": report_entries,
    }

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    report_file = OUTPUT_DIR / f"crawl_report_{timestamp}.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"\n[crawler] Report saved → {report_file}", file=sys.stderr)

    changed = report["changed"]
    print(
        f"[crawler] Done. {changed} site(s) changed, "
        f"{report['unchanged']} unchanged, "
        f"{report['fetchFailures']} fetch failure(s).",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
