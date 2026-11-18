#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TRIPWISE - Automatic Database Seed Script (seed.py)
Đọc dữ liệu địa điểm sạch từ raw_data/dalat_places_cleaned.json và tự động
nạp vào Database (hỗ trợ cả PostgreSQL / Supabase lẫn SQLite).
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Thêm đường dẫn backend vào sys.path để import chuẩn 'app.'
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from app.database.connection import Base, engine, SessionLocal
    from app.database.models import Place, RouteCluster, BenchmarkItinerary
    HAS_SQLALCHEMY = True
except ImportError:
    HAS_SQLALCHEMY = False
    import sqlite3

RAW_DATA_PATH = CURRENT_DIR / "raw_data" / "dalat_places_cleaned.json"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def seed_database():
    print("=============================================================")
    print("🚀 BẮT ĐẦU SEED DỮ LIỆU ĐỊA ĐIỂM SẠCH VÀO DATABASE (TRIPWISE)")
    print("=============================================================")

    # 1. Tự động khởi tạo cấu trúc các bảng nếu chưa có
    if HAS_SQLALCHEMY:
        print("1. Đang kiểm tra và khởi tạo các bảng CSDL (SQLAlchemy ORM)...")
        Base.metadata.create_all(bind=engine)
        print("   -> Cấu trúc bảng ORM sẵn sàng.")
        db = SessionLocal()
    else:
        print("1. [Môi trường chưa cài SQLAlchemy] Tự động kích hoạt chế độ nạp SQLite dự phòng...")
        sqlite_path = CURRENT_DIR.parent.parent / "tripwise_dalat.db"
        conn = sqlite3.connect(str(sqlite_path))
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS places (
                place_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                address TEXT,
                lat REAL,
                lng REAL,
                category TEXT,
                travel_style TEXT,
                cluster_id TEXT,
                budget_tier TEXT,
                opening_hours TEXT,
                must_try_signature TEXT,
                vibe_atmosphere TEXT,
                rating_score REAL,
                total_reviews INTEGER,
                cover_image_url TEXT,
                images TEXT,
                verification_status TEXT NOT NULL DEFAULT 'verified',
                filter_reason TEXT,
                raw_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.commit()
        print(f"   -> Đã khởi tạo bảng 'places' trong {sqlite_path.name}")
    now_utc = datetime.now(timezone.utc)

    try:
        # 2. Đọc file raw_data
        if not RAW_DATA_PATH.exists():
            print(f"❌ Lỗi: Không tìm thấy file dữ liệu tại {RAW_DATA_PATH}", file=sys.stderr)
            sys.exit(1)

        with open(RAW_DATA_PATH, "r", encoding="utf-8") as f:
            places_data = json.load(f)

        print(f"2. Đã đọc {len(places_data)} địa điểm sạch từ raw_data/dalat_places_cleaned.json.")

        # 3. Nạp địa điểm vào bảng Place
        count_inserted = 0
        count_updated = 0

        if HAS_SQLALCHEMY:
            for p in places_data:
                pid = p.get("place_id")
                if not pid:
                    continue

                existing = db.query(Place).filter(Place.id == pid).first()
                if existing:
                    existing.name = p.get("name", existing.name)
                    existing.address = p.get("address", existing.address)
                    existing.latitude = p.get("lat", existing.latitude)
                    existing.longitude = p.get("lng", existing.longitude)
                    existing.category = p.get("category", existing.category)
                    existing.tags = p.get("travel_style_json") or p.get("travel_style", [])
                    existing.image_url = p.get("cover_image_url", existing.image_url)
                    existing.cover_image_url = p.get("cover_image_url", existing.cover_image_url)
                    existing.images = p.get("images", existing.images)
                    existing.rating_score = p.get("rating_score", existing.rating_score)
                    existing.verification_status = p.get("verification_status", "verified")
                    existing.updated_at = now_utc
                    count_updated += 1
                else:
                    new_place = Place(
                        id=pid,
                        name=p.get("name", "Chưa đặt tên"),
                        city="Đà Lạt",
                        address=p.get("address"),
                        latitude=p.get("lat"),
                        longitude=p.get("lng"),
                        category=p.get("category"),
                        tags=p.get("travel_style_json") or p.get("travel_style", []),
                        cultural_note=p.get("must_try_signature"),
                        rating_score=p.get("rating_score"),
                        image_url=p.get("cover_image_url"),
                        cover_image_url=p.get("cover_image_url"),
                        images=p.get("images", []),
                        verification_status=p.get("verification_status", "verified"),
                        updated_at=now_utc,
                    )
                    db.add(new_place)
                    count_inserted += 1
            db.commit()
        else:
            for p in places_data:
                pid = p.get("place_id")
                if not pid:
                    continue
                cur.execute("SELECT 1 FROM places WHERE place_id = ?", (pid,))
                if cur.fetchone():
                    count_updated += 1
                else:
                    cur.execute("""
                        INSERT INTO places (
                            place_id, name, address, lat, lng, category,
                            travel_style, cluster_id, budget_tier, opening_hours,
                            must_try_signature, vibe_atmosphere, rating_score,
                            total_reviews, cover_image_url, images, verification_status,
                            filter_reason, raw_json, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        pid, p.get("name", "Chưa đặt tên"), p.get("address"), p.get("lat"), p.get("lng"),
                        p.get("category"), json.dumps(p.get("travel_style_json") or p.get("travel_style", []), ensure_ascii=False),
                        p.get("cluster_id"), json.dumps(p.get("budget_tier"), ensure_ascii=False) if p.get("budget_tier") else None,
                        p.get("opening_hours"), p.get("must_try_signature"), p.get("vibe_atmosphere"),
                        p.get("rating_score"), p.get("total_reviews", 0), p.get("cover_image_url"),
                        json.dumps(p.get("images", []), ensure_ascii=False), p.get("verification_status", "verified"),
                        p.get("filter_reason"), json.dumps(p, ensure_ascii=False), now_utc.isoformat()
                    ))
                    count_inserted += 1
            conn.commit()

        print(f"3. Nạp Place hoàn tất: Thêm mới {count_inserted} địa điểm, cập nhật {count_updated} địa điểm.")

        print("=============================================================")
        print("🎉 HOÀN TẤT SEED DỮ LIỆU! DATABASE ĐÃ SẴN SÀNG SỬ DỤNG.")
        print("=============================================================")

    except Exception as e:
        if HAS_SQLALCHEMY:
            db.rollback()
        else:
            conn.rollback()
        print(f"❌ Lỗi trong quá trình Seed data: {e}", file=sys.stderr)
        raise e
    finally:
        if HAS_SQLALCHEMY:
            db.close()
        else:
            conn.close()


if __name__ == "__main__":
    seed_database()
