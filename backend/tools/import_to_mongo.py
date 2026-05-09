#!/usr/bin/env python3
"""
Import crawled insurer JSON files into MongoDB insurance_products collection.

Reads backend/tools/output/{key}.json (written by crawl.py) and upserts each
product into the collection that Spring Boot's InsuranceProduct @Document uses.

Upsert key: (provider, productName)
  - Riders and coverageRatio are always overwritten with fresh crawl data.
  - monthlyPremium is only set on INSERT (not overwritten if already present),
    since the crawler does not extract premium amounts.

Usage:
  python3 import_to_mongo.py [--dry-run]

Env vars:
  MONGODB_URI      MongoDB connection string (default: mongodb://localhost:27017)
  MONGODB_DB       Database name            (default: petfit)
"""

import argparse
import json
import os
import sys
from pathlib import Path

TOOLS_DIR = Path(__file__).parent
OUTPUT_DIR = TOOLS_DIR / "output"
COLLECTION = "insurance_products"

# Crawler keys → output file names (must match crawl.py SITES[*]["key"])
CRAWLER_KEYS = [
    "meritz_petpermint",
    "kb_pet",
    "hyundai_goodngood",
    "samsung_famili",
]


def load_extracted(key: str) -> dict | None:
    path = OUTPUT_DIR / f"{key}.json"
    if not path.exists():
        print(f"  [SKIP] {path} not found — run crawl.py first", file=sys.stderr)
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def map_rider(raw: dict) -> dict:
    """Map crawled rider dict → MongoDB Rider embedded document."""
    return {
        "riderName": raw.get("riderName") or "",
        "coveredDiseases": raw.get("coveredDiseases") or [],
        "coverageLimit": raw.get("limitPerClaim"),  # null when not on page
    }


def build_document(extracted: dict) -> dict:
    """Build the InsuranceProduct MongoDB document from extracted crawl data."""
    riders = [map_rider(r) for r in extracted.get("riders", []) if r.get("riderName")]
    return {
        "productName": extracted.get("productName") or "",
        "provider": extracted.get("provider") or "",
        "riders": riders,
        # Extra crawl fields stored for reference (not in Spring @Document fields
        # but harmless in Mongo schema-less storage)
        "coverageRatio": extracted.get("coverageRatio"),
        "waitingPeriodNotes": extracted.get("waitingPeriodNotes", []),
    }


def upsert(collection, doc: dict, dry_run: bool) -> str:
    """Upsert by (provider, productName). Returns 'inserted' | 'updated' | 'dry-run'."""
    filter_q = {
        "provider": doc["provider"],
        "productName": doc["productName"],
    }
    update = {
        "$set": {
            "riders": doc["riders"],
            "coverageRatio": doc["coverageRatio"],
            "waitingPeriodNotes": doc["waitingPeriodNotes"],
        },
        # monthlyPremium only set when the document is first created
        "$setOnInsert": {
            "monthlyPremium": None,
        },
    }

    if dry_run:
        return "would-insert"

    result = collection.update_one(filter_q, update, upsert=True)
    if result.upserted_id:
        return "inserted"
    return "updated"


def main():
    parser = argparse.ArgumentParser(description="Import crawl output into MongoDB")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing")
    args = parser.parse_args()

    try:
        from pymongo import MongoClient
    except ImportError:
        print("ERROR: pymongo not installed. Run: pip install pymongo", file=sys.stderr)
        sys.exit(1)

    uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.environ.get("MONGODB_DB", "petfit")

    if args.dry_run:
        print("[DRY RUN] No writes will be made — skipping MongoDB connection.\n")
        col = None
    else:
        print(f"Connecting to {uri} / {db_name}…", file=sys.stderr)
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        try:
            client.admin.command("ping")
        except Exception as exc:
            print(f"ERROR: Cannot reach MongoDB: {exc}", file=sys.stderr)
            sys.exit(1)
        col = client[db_name][COLLECTION]

    results = []
    for key in CRAWLER_KEYS:
        extracted = load_extracted(key)
        if extracted is None:
            results.append({"key": key, "status": "skipped"})
            continue

        doc = build_document(extracted)
        status = upsert(col, doc, dry_run=args.dry_run)

        results.append({
            "key": key,
            "provider": doc["provider"],
            "productName": doc["productName"],
            "riders": len(doc["riders"]),
            "coverageRatio": doc["coverageRatio"],
            "status": status,
        })

        icon = {"inserted": "+", "updated": "~", "would-insert": "+?",
                "would-update": "~?", "skipped": "x"}.get(status, "?")
        print(
            f"  [{icon}] {doc['provider']} / {doc['productName']}"
            f"  ({len(doc['riders'])} riders, ratio={doc['coverageRatio']})  → {status}"
        )

    print()
    inserted = sum(1 for r in results if r["status"] in ("inserted", "would-insert"))
    updated  = sum(1 for r in results if r["status"] in ("updated",  "would-update"))
    skipped  = sum(1 for r in results if r["status"] == "skipped")
    print(f"Done — {inserted} inserted, {updated} updated, {skipped} skipped.")

    if not args.dry_run:
        client.close()


if __name__ == "__main__":
    main()
