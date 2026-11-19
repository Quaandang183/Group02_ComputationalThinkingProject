"""
TRIPWISE - Core System Configuration (config.py)
Tự động nạp và kiểm tra tính hợp lệ của các biến môi trường từ .env.
Đảm bảo an toàn, không bao giờ để lộ API Key nhạy cảm.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    # App General Settings
    APP_NAME: str = "TripWise Da Lat Backend"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database Configuration
    DATABASE_URL: str = Field(
        default="sqlite:///./tripwise_dalat.db",
        description="Chuỗi kết nối CSDL (PostgreSQL hoặc SQLite)"
    )

    # Supabase Credentials
    SUPABASE_URL: str = Field(default="", description="Supabase Project URL")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", description="Secret Key admin cho backend")
    SUPABASE_ANON_KEY: str = Field(default="", description="Publishable Key cho client")

    # AI & External Tool Services
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini AI Vision & Planning API Key")
    GOOGLE_MAPS_API_KEY: str = Field(default="", description="Google Maps Platform API Key")
    OPENWEATHER_API_KEY: str = Field(default="", description="OpenWeatherMap API Key")

    # Security & Auth Settings (JWT)
    JWT_SECRET_KEY: str = Field(
        default="default_insecure_secret_key_change_in_production",
        description="Khóa bí mật dùng để ký và xác thực JWT Token"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 giờ

    # Rate Limiting & Networking
    DEFAULT_RATE_LIMIT: str = "60/minute"
    AI_RATE_LIMIT: str = "3/minute"

    # Mobile Deep Linking & CORS
    MOBILE_DEEP_LINK_SCHEME: str = "tripwise://"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8081,tripwise://*"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
