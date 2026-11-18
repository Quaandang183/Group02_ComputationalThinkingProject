"""
TRIPWISE - SQLAlchemy ORM Models (models.py)
Định nghĩa đầy đủ 13 bảng ORM chuẩn xác theo kiến trúc hệ thống TripWise:
1. User (users)
2. UserProfile (user_profiles)
3. Place (places)
4. Trip (trips)
5. Itinerary (itineraries)
6. TripMember (trip_members)
7. ActivityCheckin (activity_checkins)
8. Notification (notifications)
9. Expense (expenses)
10. ExpenseSplit (expense_splits)
11. RouteCluster (route_clusters)
12. BenchmarkItinerary (benchmark_itineraries)
13. UserFavorite (user_favorites)
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON

from app.database.connection import Base


def get_json_type():
    """Hỗ trợ cả PostgreSQL JSONB lẫn SQLite JSON linh hoạt."""
    return JSON().with_variant(JSONB, "postgresql")


def utcnow():
    """Trả về thời gian hiện tại chuẩn UTC."""
    return datetime.now(timezone.utc)


# ==============================================================================
# 1. BẢNG USERS & USER_PROFILES
# ==============================================================================
class User(Base):
    """Bảng người dùng hệ thống."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    trips_owned = relationship("Trip", back_populates="owner", cascade="all, delete-orphan")
    trip_memberships = relationship("TripMember", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    """Hồ sơ cá nhân và sở thích du lịch của người dùng."""
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    travel_styles = Column(get_json_type(), default=list)  # ["Chill & thư giãn", "Khám phá"]
    food_preferences = Column(get_json_type(), default=list)
    budget_level = Column(String(50), default="Trung bình")
    disliked_tags = Column(get_json_type(), default=list)

    # Relationship
    user = relationship("User", back_populates="profile")


# ==============================================================================
# 2. BẢNG PLACES (ĐỊA ĐIỂM DU LỊCH)
# ==============================================================================
class Place(Base):
    """Địa điểm du lịch, ẩm thực, lưu trú và văn hóa tại Đà Lạt."""
    __tablename__ = "places"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    city = Column(String(100), nullable=True, index=True)
    category = Column(String(100), nullable=True, index=True)  # hotel/food/attraction/culture
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    open_time = Column(String(50), nullable=True)
    close_time = Column(String(50), nullable=True)
    avg_duration_mins = Column(Integer, nullable=True)
    ticket_price = Column(Float, nullable=True, index=True)
    is_indoor = Column(Boolean, default=False)
    cultural_note = Column(Text, nullable=True)
    tags = Column(get_json_type(), default=list)
    image_url = Column(Text, nullable=True)

    # Extra columns hữu ích cho dữ liệu thực tế
    cover_image_url = Column(Text, nullable=True)
    images = Column(get_json_type(), default=list)
    rating_score = Column(Numeric(3, 2), nullable=True)
    google_maps_url = Column(Text, nullable=True)
    verification_status = Column(String(50), default="verified")
    updated_at = Column(DateTime, default=utcnow)

    __table_args__ = (
        Index("idx_places_coordinates", "latitude", "longitude"),
        Index("idx_places_category_rating", "category", "rating_score"),
    )


# ==============================================================================
# 3. BẢNG TRIPS & ITINERARIES (QUẢN LÝ CHUYẾN ĐI & LỊCH TRÌNH)
# ==============================================================================
class Trip(Base):
    """Chuyến đi và kế hoạch tổng thể của nhóm hoặc cá nhân."""
    __tablename__ = "trips"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    destination_city = Column(String(100), default="Đà Lạt", index=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    total_budget = Column(Numeric(12, 2), default=0.0)
    status = Column(String(20), default="DRAFT", nullable=False)  # DRAFT / ACTIVE / COMPLETED
    budget_breakdown = Column(get_json_type(), default=dict)  # 6 khoản mục ngân sách
    checklist_items = Column(get_json_type(), default=list)
    invite_code = Column(String(10), unique=True, nullable=False, index=True, default=lambda: uuid.uuid4().hex[:8].upper())
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    owner = relationship("User", back_populates="trips_owned")
    itineraries = relationship("Itinerary", back_populates="trip", cascade="all, delete-orphan")
    members = relationship("TripMember", back_populates="trip", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="trip", cascade="all, delete-orphan")


class Itinerary(Base):
    """Chi tiết các chặng trong lịch trình theo từng ngày của chuyến đi."""
    __tablename__ = "itineraries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    place_id = Column(String(64), ForeignKey("places.id", ondelete="SET NULL"), nullable=True)
    day_number = Column(Integer, nullable=False, default=1)
    order_index = Column(Integer, nullable=False, default=0)
    start_time = Column(String(10), nullable=True)  # "08:00"
    end_time = Column(String(10), nullable=True)    # "10:00"
    travel_time_mins = Column(Integer, default=0)
    distance_km = Column(Float, default=0.0)
    estimated_cost = Column(Float, default=0.0)
    match_score = Column(Integer, default=0)  # % Hợp gu
    ai_reason = Column(Text, nullable=True)
    status = Column(String(20), default="PENDING")  # PENDING/IN_PROGRESS/COMPLETED/SKIPPED

    # Relationship
    trip = relationship("Trip", back_populates="itineraries")


# ==============================================================================
# 4. BẢNG TRIP_MEMBERS (THÀNH VIÊN CHUYẾN ĐI)
# ==============================================================================
class TripMember(Base):
    """Thành viên tham gia chuyến đi và vai trò trong nhóm."""
    __tablename__ = "trip_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), default="MEMBER")  # OWNER / MEMBER
    invite_code = Column(String(10), unique=True, nullable=False, index=True, default=lambda: uuid.uuid4().hex[:8].upper())
    joined_at = Column(DateTime, default=utcnow)

    # Relationships
    trip = relationship("Trip", back_populates="members")
    user = relationship("User", back_populates="trip_memberships")

    __table_args__ = (
        UniqueConstraint("trip_id", "user_id", name="uq_trip_member"),
    )


# ==============================================================================
# 5. BẢNG ACTIVITY_CHECKINS (CHECK-IN GPS ĐỒNG THỜI)
# ==============================================================================
class ActivityCheckin(Base):
    """Lịch sử check-in GPS tại các điểm trong lịch trình."""
    __tablename__ = "activity_checkins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    itinerary_id = Column(String(36), ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    checkin_lat = Column(Float, nullable=True)
    checkin_lng = Column(Float, nullable=True)
    checked_in_at = Column(DateTime, default=utcnow)

    __table_args__ = (
        UniqueConstraint("itinerary_id", "user_id", name="uq_itinerary_user_checkin"),
    )


# ==============================================================================
# 6. BẢNG NOTIFICATIONS (THÔNG BÁO)
# ==============================================================================
class Notification(Base):
    """Thông báo hệ thống, thời tiết, giao thông và nhóm cho người dùng."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # WEATHER/TRAFFIC/CLOSED/CHECKIN/GROUP
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    action_payload = Column(get_json_type(), default=dict)  # lưu suggested_place_id
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
    trip = relationship("Trip", back_populates="notifications")

    __table_args__ = (
        Index("idx_notifications_user_read", "user_id", "is_read"),
    )


# ==============================================================================
# 7. BẢNG EXPENSES & EXPENSE_SPLITS (CHI TIÊU & CHIA TIỀN)
# ==============================================================================
class Expense(Base):
    """Khoản chi tiêu phát sinh trong chuyến đi."""
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    payer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    itinerary_id = Column(String(36), ForeignKey("itineraries.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    category = Column(String(100), nullable=True)
    split_type = Column(String(20), default="EQUAL")  # EQUAL / CUSTOM
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    trip = relationship("Trip", back_populates="expenses")
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")


class ExpenseSplit(Base):
    """Phân chia tiền chi tiêu và trạng thái quyết toán cho từng thành viên."""
    __tablename__ = "expense_splits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    expense_id = Column(Integer, ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    owed_amount = Column(Numeric(12, 2), nullable=False)
    is_settled = Column(Boolean, default=False, nullable=False)

    # Relationship
    expense = relationship("Expense", back_populates="splits")


# ==============================================================================
# 8. CÁC BẢNG BONUS (DỮ LIỆU ĐÀ LẠT: ROUTE CLUSTER, BENCHMARK, FAVORITES)
# ==============================================================================
class RouteCluster(Base):
    """Cụm tuyến đường du lịch tại Đà Lạt phục vụ thuật toán tối ưu di chuyển."""
    __tablename__ = "route_clusters"

    cluster_id = Column(String(64), primary_key=True)
    name = Column(String(200), nullable=False)
    raw_json = Column(get_json_type(), default=dict)
    created_at = Column(DateTime, default=utcnow)


class BenchmarkItinerary(Base):
    """Lịch trình mẫu chuẩn (benchmark) tại Đà Lạt để AI tham khảo và gợi ý."""
    __tablename__ = "benchmark_itineraries"

    itinerary_id = Column(String(64), primary_key=True)
    title = Column(String(255), nullable=False)
    raw_json = Column(get_json_type(), default=dict)
    created_at = Column(DateTime, default=utcnow)


class UserFavorite(Base):
    """Danh sách địa điểm yêu thích được người dùng lưu lại."""
    __tablename__ = "user_favorites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), nullable=False)
    place_id = Column(String(64), ForeignKey("places.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "place_id", name="uq_user_favorite_place"),
    )
