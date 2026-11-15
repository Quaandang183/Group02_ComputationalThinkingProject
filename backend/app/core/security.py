"""
TRIPWISE - Core Security & Authentication Module (security.py)
Phụ trách:
1. Băm mật khẩu bằng Bcrypt (get_password_hash, verify_password).
2. Cấp phát & giải mã JWT Token (create_access_token, decode_access_token).
3. Rate Limiting phân tầng (SlowAPI) bảo vệ API và chống spam AI (HTTP 429).
4. Thiết lập CORS an toàn cho Mobile App và Web.
5. Middleware phân quyền thành viên nhóm (Trip Member Authorization).
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings

# ==============================================================================
# 1. BĂM MẬT KHẨU (BCRYPT PASSWORD HASHING)
# ==============================================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kiểm tra mật khẩu người dùng nhập có khớp với chuỗi băm Bcrypt trong DB không."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Mã hóa mật khẩu bằng thuật toán Bcrypt trước khi lưu vào Database."""
    return pwd_context.hash(password)


# ==============================================================================
# 2. XÁC THỰC NGƯỜI DÙNG BẰNG JWT TOKEN
# ==============================================================================
security_bearer = HTTPBearer(auto_error=False)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Cấp phát JWT Access Token kèm thời gian hết hạn an toàn."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """Giải mã và kiểm tra tính hợp lệ của JWT Token. Bắn lỗi nếu token hết hạn hoặc giả mạo."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token xác thực không hợp lệ.",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_id(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> str:
    """Dependency trích xuất user_id từ Authorization Bearer Token trong Header."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu đăng nhập để thực hiện hành động này.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không chứa thông tin định danh người dùng.",
        )
    return str(user_id)


# ==============================================================================
# 3. RATE LIMITING (SLOWAPI) & CẤU HÌNH CORS
# ==============================================================================
# Khởi tạo bộ chặn Rate Limiter theo địa chỉ IP của Client
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.DEFAULT_RATE_LIMIT],
)


def setup_security_and_cors(app: Any) -> None:
    """Gắn Middleware CORS và bộ bắt lỗi Rate Limit vào ứng dụng FastAPI chính."""
    # 1. Gắn Handler cho lỗi 429 Too Many Requests
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # 2. Cấu hình CORS an toàn
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
    )


# ==============================================================================
# 4. PHÂN QUYỀN TRUY CẬP NHÓM DU LỊCH (TRIP ACCESS AUTHORIZATION)
# ==============================================================================
def check_group_member_permission(user_id: str, trip_id: str, db_session: Any) -> bool:
    """
    Kiểm tra người dùng hiện tại có phải thành viên hợp lệ trong Trip_Members của chuyến đi không.
    Ngăn chặn hoàn toàn truy cập trái phép từ user ngoài nhóm.
    """
    from app.database.models import Trip, TripMember

    # 1. Kiểm tra nếu là Trưởng nhóm (Owner)
    is_owner = db_session.query(Trip).filter(Trip.trip_id == trip_id, Trip.owner_id == user_id).first()
    if is_owner:
        return True

    # 2. Kiểm tra nếu là Thành viên tham gia
    is_member = db_session.query(TripMember).filter(TripMember.trip_id == trip_id, TripMember.user_id == user_id).first()
    return bool(is_member)
