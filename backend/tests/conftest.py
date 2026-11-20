import pytest
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
from app.database.connection import Base, get_db

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Khởi tạo toàn bộ 10 bảng ORM sạch trên RAM trước mỗi test và xóa sau khi chạy xong."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """TestClient của FastAPI dùng DB ảo thay vì PostgreSQL/DB thật."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def mock_maps_service(monkeypatch):
    """Giả lập maps_service.py: khoảng cách, thời gian di chuyển và kiểm tra GPS <= 300m."""
    mock = MagicMock()
    mock.get_route_info.return_value = {
        "distance_km": 3.5,
        "travel_time_mins": 12,
        "traffic_status": "NORMAL",
    }
    mock.calculate_haversine_meters.return_value = 120.0  # Hợp lệ (<= 300m)

    # Gắn monkeypatch vào module thực tế khi Backend hoàn thiện maps_service.py:
    # monkeypatch.setattr("app.modules.tool_usage.maps_service.get_route_info", mock.get_route_info)
    return mock


@pytest.fixture
def mock_weather_service(monkeypatch):
    """Giả lập weather_service.py: trả về nắng hoặc mưa bão để test feasibility_checker."""
    mock = MagicMock()
    mock.get_forecast.return_value = {
        "city": "Đà Lạt",
        "date": "2026-10-24",
        "hourly": [
            {"time": "09:00", "condition": "SUNNY", "rain_prob": 0.1},
            {"time": "15:00", "condition": "HEAVY_RAIN", "rain_prob": 0.9},
        ],
    }
    return mock


@pytest.fixture
def mock_ai_llm(monkeypatch):
    """Giả lập phản hồi JSON chuẩn từ TravelAgent LLM (prompts.py / reranker.py)."""
    mock = MagicMock()
    mock.generate_itinerary.return_value = {
        "trip_title": "Đà Lạt 3N2Đ",
        "match_score": 95,
        "days": [
            {
                "day_number": 1,
                "items": [
                    {
                        "place_name": "Dinh III Bảo Đại",
                        "start_time": "08:30",
                        "end_time": "10:30",
                        "estimated_cost": 40000.0,
                    }
                ],
            }
        ],
    }
    return mock