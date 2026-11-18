"""
TRIPWISE - Optimized Database Queries & CRUD Repository (queries.py)
Phân chia nghiêm ngặt thành 4 khu vực theo quy tắc làm việc nhóm:
1. AUTH & SECURITY QUERIES (Phụ trách: Security & DB)
2. PLACES & SEED QUERIES (Phụ trách: Security & DB)
3. TRIP, GROUP & CHECK-IN QUERIES (Phụ trách: Backend)
4. NOTICE & EXPENSE QUERIES (Phụ trách: Backend)
"""

import math
from typing import Any, Dict, List, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database.models import (
    ActivityCheckin,
    BenchmarkItinerary,
    Expense,
    ExpenseSplit,
    Itinerary,
    Notification,
    Place,
    RouteCluster,
    Trip,
    TripMember,
    User,
    UserFavorite,
    UserProfile,
)


# ==============================================================================
# 1. AUTH & SECURITY QUERIES (Security & DB)
# ==============================================================================
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Tìm kiếm người dùng theo email duy nhất."""
    return db.query(User).filter(func.lower(User.email) == func.lower(email.strip())).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Tìm kiếm người dùng theo ID định danh."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, email: str, hashed_password: str, full_name: Optional[str] = None) -> User:
    """Tạo mới tài khoản người dùng và hồ sơ du lịch mặc định (UserProfile)."""
    user = User(email=email, hashed_password=hashed_password, full_name=full_name)
    db.add(user)
    db.flush()

    profile = UserProfile(user_id=user.id, travel_styles=[], budget_level="Trung bình")
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user


def is_user_in_trip(db: Session, user_id: str, trip_id: str) -> bool:
    """Kiểm tra quyền bảo mật: User có thuộc nhóm chuyến đi này không."""
    is_owner = db.query(Trip).filter(Trip.id == trip_id, Trip.owner_id == user_id).first()
    if is_owner:
        return True
    is_member = db.query(TripMember).filter(TripMember.trip_id == trip_id, TripMember.user_id == user_id).first()
    return bool(is_member)


# ==============================================================================
# 2. PLACES & SEED QUERIES (Security & DB)
# ==============================================================================
def get_place_by_id(db: Session, place_id: str) -> Optional[Place]:
    """Lấy chi tiết địa điểm du lịch kèm ảnh và thông tin đặc trưng."""
    return db.query(Place).filter(Place.id == place_id).first()


def get_verified_places(
    db: Session,
    category: Optional[str] = None,
    cluster_id: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[Place]:
    """
    Lấy danh sách các địa điểm đã kiểm duyệt, hỗ trợ lọc theo danh mục hoặc cụm tuyến.
    Tối ưu hóa tránh N+1 query.
    """
    q = db.query(Place).filter(Place.verification_status == "verified")
    if category:
        q = q.filter(Place.category.ilike(f"%{category}%"))
    if cluster_id:
        q = q.filter(Place.cluster_id == cluster_id)

    return q.order_by(Place.rating_score.desc().nullslast()).offset(offset).limit(limit).all()


def get_nearby_places_haversine(
    db: Session,
    user_lat: float,
    user_lng: float,
    radius_km: float = 5.0,
    max_results: int = 20,
) -> List[Dict[str, Any]]:
    """
    Tìm kiếm các địa điểm trong bán kính GPS bằng thuật toán Haversine gom gọn.
    Tốc độ xử lý < 50ms cho tập dữ liệu Đà Lạt.
    """
    places = db.query(Place).filter(
        Place.latitude.isnot(None),
        Place.longitude.isnot(None),
        Place.verification_status == "verified",
    ).all()

    results = []
    r = 6371.0  # Bán kính Trái Đất (km)
    lat1 = math.radians(user_lat)
    lng1 = math.radians(user_lng)

    for p in places:
        lat2 = math.radians(p.latitude)
        lng2 = math.radians(p.longitude)
        dlat = lat2 - lat1
        dlng = lng2 - lng1

        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
        c = 2 * math.asin(math.sqrt(a))
        distance = r * c

        if distance <= radius_km:
            results.append({
                "place_id": p.id,
                "name": p.name,
                "category": p.category,
                "address": p.address,
                "rating_score": float(p.rating_score) if p.rating_score else None,
                "cover_image_url": p.cover_image_url,
                "lat": p.latitude,
                "lng": p.longitude,
                "distance_km": round(distance, 2),
            })

    results.sort(key=lambda x: x["distance_km"])
    return results[:max_results]


def search_places_text(db: Session, keyword: str, limit: int = 20) -> List[Place]:
    """Tìm kiếm nhanh địa điểm theo từ khóa tên hoặc địa chỉ."""
    clean_kw = f"%{keyword.strip()}%"
    return (
        db.query(Place)
        .filter(
            Place.verification_status == "verified",
            or_(Place.name.ilike(clean_kw), Place.address.ilike(clean_kw), Place.category.ilike(clean_kw)),
        )
        .order_by(Place.rating_score.desc().nullslast())
        .limit(limit)
        .all()
    )


# ==============================================================================
# 3. TRIP, GROUP & CHECK-IN QUERIES (Backend)
# ==============================================================================
# Khu vực dành riêng cho bạn phụ trách Backend chính triển khai:
# - create_trip()
# - add_trip_member_by_invite_code()
# - record_activity_checkin()
# ==============================================================================


# ==============================================================================
# 4. NOTICE & EXPENSE QUERIES (Backend)
# ==============================================================================
# Khu vực dành riêng cho bạn phụ trách Backend chính triển khai:
# - get_user_notifications()
# - mark_notification_as_read()
# - create_expense_and_splits()
# ==============================================================================
