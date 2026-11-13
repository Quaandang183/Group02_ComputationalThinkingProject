```text
tripwise/
├── frontend/                           # Giao diện Mobile App (React Native / Flutter)
│   └── src/
│       ├── screens/                    # Các màn hình chính của ứng dụng
│       ├── components/                 # Các cụm UI tái sử dụng
│       └── services/                   # Kết nối API Backend, xin quyền GPS & xử lý Deep Link mời nhóm
│
├── backend/                            # Hệ thống xử lý ngầm, CSDL & AI (FastAPI)
│   ├── app/
│   │   ├── __init__.py                 # Đánh dấu package chính của ứng dụng
│   │   │
│   │   ├── api/                        # 🔌 CỔNG GIAO TIẾP API (ENDPOINTS)
│   │   │   ├── __init__.py
│   │   │   ├── auth_routes.py          # (Tùy chọn) API Đăng nhập, Đăng ký, lấy thông tin User hiện tại
│   │   │   ├── trip_routes.py          # API Tạo/Áp dụng/Tạo lại lịch trình, Link mời nhóm, Check-in & Chia tiền
│   │   │   └── culture_routes.py       # API Khám phá văn hóa & Quản lý thông báo Notice (Đã đọc/Chưa đọc)
│   │   │
│   │   ├── core/                       # 🛡️ BẢO MẬT & CẤU HÌNH HỆ THỐNG
│   │   │   ├── __init__.py
│   │   │   ├── config.py               # Đọc biến môi trường từ .env (API Keys, DB URL, cấu hình Deep Link)
│   │   │   └── security.py             # Mã hóa Bcrypt, xác thực JWT, phân quyền nhóm & Rate Limiting chống spam AI
│   │   │
│   │   ├── database/                   # 🗄️ CƠ SỞ DỮ LIỆU & TRUY VẤN TỐI ƯU
│   │   │   ├── raw_data/               # Thư mục chứa các file JSON/CSV dữ liệu địa điểm & văn hóa gốc
│   │   │   ├── __init__.py
│   │   │   ├── connection.py           # Khởi tạo kết nối DB, quản lý Session & cấu hình Connection Pooling
│   │   │   ├── models.py               # Định nghĩa bảng ORM + Indexing (Users, Trips, Places, Trip_Members, Checkins, Notifications, Expenses...)
│   │   │   ├── queries.py              # Gom toàn bộ hàm CRUD & truy vấn tối ưu (Lọc điểm, lấy nhóm, cập nhật Notice)
│   │   │   └── seed.py                 # Script đọc dữ liệu từ raw_data/ và nạp tự động vào Database
│   │   │
│   │   ├── modules/                    # 🧠 4 MÔ-ĐUN CỐT LÕI (TRAVELAGENT ARCHITECTURE)
│   │   │   ├── __init__.py
│   │   │   │
│   │   │   ├── memory/                 # [Mô-đun 1: Bộ nhớ]
│   │   │   │   ├── __init__.py
│   │   │   │   ├── short_term.py       # Lưu phiên làm việc, bản nháp, lý do chê khi bấm "Tạo kế hoạch khác" & tiến độ Check-in
│   │   │   │   ├── long_term.py        # Đọc/cập nhật gu du lịch dài hạn & hợp nhất sở thích chung của cả nhóm (Group Profile)
│   │   │   │   └── memory_extractor.py # Dùng LLM phân tích hành vi sửa/xóa điểm & tag phản hồi để rút trích sở thích mới
│   │   │   │
│   │   │   ├── planning/               # [Mô-đun 4: Lập kế hoạch - Lõi trung tâm]
│   │   │   │   ├── __init__.py
│   │   │   │   ├── prompts.py          # Chứa System Prompts ép AI đóng vai TravelAgent & trả về đúng định dạng
│   │   │   │   ├── json_schemas.py     # Định nghĩa Pydantic Models đầu vào/đầu ra cho Lịch trình, Nhóm, Check-in, Ngân sách
│   │   │   │   ├── budget_planner.py   # Phân bổ ngân sách 6 mục + Thuật toán Chia tiền nhóm & Tối giản công nợ (Làm sau)
│   │   │   │   ├── checklist_generator.py # Gọi AI sinh danh sách vật dụng cần chuẩn bị theo thời tiết & địa điểm
│   │   │   │   ├── route_optimizer.py  # Thuật toán TSP/Greedy sắp xếp thứ tự điểm đi tối ưu quãng đường di chuyển
│   │   │   │   ├── feasibility_checker.py # Kiểm tra chéo 3 điều kiện: Giờ mở cửa, Quỹ thời gian (sau Check-in) & Thời tiết/Ngân sách
│   │   │   │   └── replanning_engine.py# Tự động đổi điểm khi mưa/tắc đường (bắn ra Notice) & Tạo lại kế hoạch theo phản hồi chê
│   │   │   │
│   │   │   ├── recommendation/         # [Mô-đun 3: Gợi ý & Khám phá]
│   │   │   │   ├── __init__.py
│   │   │   │   ├── cultural_explorer.py# Truy xuất danh sách địa điểm & bài học văn hóa đặc sắc tại địa phương
│   │   │   │   └── reranker.py         # Chấm điểm độ hợp gu (% Match), xếp hạng địa điểm & sinh bộ tag đoán ý khi người dùng chê
│   │   │   │
│   │   │   └── tool_usage/             # [Mô-đun 2: Sử dụng công cụ bên ngoài]
│   │   │       ├── __init__.py
│   │   │       ├── maps_service.py     # Gọi Maps API lấy khoảng cách, lộ trình, cảnh báo tắc đường & tính khoảng cách GPS Check-in
│   │   │       ├── weather_service.py  # Gọi OpenWeather API lấy dự báo thời tiết & kích hoạt cảnh báo mưa cho trang Notice
│   │   │       ├── places_service.py   # Kết hợp DB nội bộ & Google Places API lấy giờ đóng/mở cửa, giá vé thực tế
│   │   │       └── agent_tools.py      # Định nghĩa Function Calling / Tool Schema để LLM tự động gọi 3 service trên
│   │   │
│   │   └── utils/                      # 🛠️ TIỆN ÍCH PHỤ TRỢ
│   │       ├── __init__.py
│   │       └── exporter.py             # Xuất lịch trình ra file PDF + Sinh mã mời ngắn (invite_code) & QR/Link gom nhóm
│   │
│   ├── tests/                          # 🧪 KIỂM THỬ TỰ ĐỘNG (QA/QC)
│   │   ├── __init__.py
│   │   ├── conftest.py                 # Khởi tạo DB ảo (SQLite in-memory) & Mock dữ liệu AI/Maps để test không tốn quota
│   │   ├── test_feasibility.py         # Test trường hợp biên: Ngân sách thấp, mưa bão, trùng giờ, GPS Check-in & Chia tiền lẻ
│   │   └── test_api_endpoints.py       # Test luồng gọi API: Tạo nhóm qua link, trạng thái Đã đọc/Chưa đọc Notice & Rate Limit
│   │
│   ├── .env.example                    # File mẫu khai báo danh sách các biến môi trường cần thiết
│   ├── requirements.txt                # Danh sách các thư viện Python cần cài đặt (FastAPI, SQLAlchemy, SlowAPI...)
│   └── main.py                         # Điểm khởi chạy Server FastAPI, gắn Middleware CORS, Rate Limiter & nạp Routers
│
└── docs/                               # 📄 TÀI LIỆU & BÁO CÁO ĐỒ ÁN
    └── presentation/                   # Slide thuyết trình, kịch bản bảo vệ & video demo dự phòng
```


# 🤝 Quy Tắc Làm Việc Nhóm & Đóng Góp Code - Dự Án TripWise

Tài liệu này quy định các nguyên tắc thống nhất về Git, phân vùng file và chuẩn viết code cho toàn bộ thành viên dự án **TripWise (Mobile App + AI Backend)** nhằm tránh xung đột (conflict) và đảm bảo tiến độ 4 tuần.

---

## 1. Quy Tắc Git & Phân Nhánh (Chống Conflict)

### 1.1. Cấu trúc 3 tầng nhánh (Branching Strategy)
* **`main`**: Nhánh sản phẩm ổn định phục vụ Demo. Chỉ Leader được phép merge từ `develop` sang sau khi QA/QC đã kiểm thử cuối mỗi tuần.
* **`develop`**: Nhánh tích hợp chung của cả nhóm trong suốt quá trình code.
* **Nhánh cá nhân (Feature Branches)**: Luôn tách nhánh mới từ `develop` theo cú pháp `<vai-trò>/<tên-tính-năng>`:
  * Backend: `be/trip-routes`, `be/checkin-gps`, `be/bill-splitting`
  * Security & DB: `db/models-init`, `db/rate-limiting`, `db/seed-data`
  * AI Integration: `ai/reranker`, `ai/replanning-engine`, `ai/prompts`
  * Mobile Frontend: `fe/plan-preview`, `fe/group-invite`, `fe/notice-screen`
  * QA/QC: `qa/test-feasibility`, `qa/test-api`

### 1.2. Quy trình 4 bước trước khi Push & Merge
1. Trước khi bắt đầu ca code hoặc trước khi push, luôn kéo code mới nhất về:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout <nhánh-cá-nhân>
   git merge develop
   ```
2. Chạy thử server / app / pytest tại máy cá nhân đảm bảo không báo lỗi cú pháp.
3. Push lên nhánh cá nhân:
   ```bash
   git push origin <nhánh-cá-nhân>
   ```
4. Tạo **Pull Request (PR)** vào nhánh `develop` trên GitHub và nhắn vào nhóm để duyệt. **Tuyệt đối không dùng `git push --force` lên `main` hoặc `develop`.**

### 1.3. Chuẩn tin nhắn Commit (Commit Message)
Viết ngắn gọn theo cấu trúc `<loại>(<phạm-vi>): <nội-dung>`:
* `feat(db): add Trip_Members and Activity_Checkins tables` (Thêm tính năng mới)
* `fix(api): handle HTTP 429 rate limit on generate endpoint` (Sửa lỗi)
* `refactor(ai): optimize system prompt token length` (Tối ưu code)
* `test(qa): add unit tests for odd bill splitting` (Thêm kiểm thử)
* `docs(readme): update directory tree` (Cập nhật tài liệu)

---

## 2. Quy Tắc Phân Vùng & Sở Hữu File (Tránh Đụng Độ Code)

Ai phụ trách file nào theo bảng Timeline thì chỉ chỉnh sửa trong file đó. Với **4 file dùng chung (Điểm nóng dễ conflict)**, toàn nhóm tuân thủ quy tắc sau:

1. **`backend/app/modules/planning/json_schemas.py`** *(Backend + AI Integration)*:
   * Chốt cứng tên trường dữ liệu ngay đầu Tuần 1–2.
   * Bất kỳ ai muốn đổi tên biến hoặc thêm trường mới trong file này **phải nhắn báo lên nhóm** để Frontend, Backend và AI cập nhật đồng bộ.
2. **`backend/app/database/queries.py`** *(Backend + Security & DB)*:
   * Chia sẵn file thành 4 khu vực bằng dòng comment lớn, ai viết hàm thuộc mảng nào thì đặt đúng vào khu vực đó (không viết đan xen):
   ```python
   # ==========================================
   # 1. AUTH & SECURITY QUERIES (Security & DB)
   # ==========================================

   # ==========================================
   # 2. PLACES & SEED QUERIES (Security & DB)
   # ==========================================

   # ==========================================
   # 3. TRIP, GROUP & CHECK-IN QUERIES (Backend)
   # ==========================================

   # ==========================================
   # 4. NOTICE & EXPENSE QUERIES (Backend)
   # ==========================================
   ```
3. **`backend/main.py`** *(Chỉ Backend chính chỉnh sửa)*:
   * Dùng để khởi tạo FastAPI, gắn CORS, Rate Limiter và nạp các Router từ `api/`. Các thành viên khác không tự ý sửa file này.
4. **`backend/requirements.txt`**:
   * Ai cài thêm thư viện mới bằng `pip install <tên-thư-viện>` phải ghi ngay tên và phiên bản thư viện đó vào `requirements.txt` và nhắc cả nhóm chạy lại `pip install -r requirements.txt`.

---

## 3. Quy Chuẩn Viết Code (Coding Conventions)

### 3.1. Đối với Backend, AI, DB & QA/QC (Python)
* **Đặt tên**:
  * Biến, hàm, tên file: `snake_case` (VD: `verify_gps_checkin`, `invite_code`).
  * Class (SQLAlchemy Models, Pydantic Schemas): `PascalCase` (VD: `TripMember`, `ReplanFeedbackRequest`).
  * Hằng số cấu hình: `UPPER_SNAKE_CASE` (VD: `MAX_CHECKIN_RADIUS_METERS = 300`).
* **Type Hints & Docstring bắt buộc**: Mọi hàm viết trong `modules/` và `queries.py` phải ghi rõ kiểu dữ liệu đầu vào/đầu ra và 1 dòng chú thích mục đích hàm:
  ```python
  def check_geofence(user_lat: float, user_lng: float, target_lat: float, target_lng: float) -> bool:
      """Kiểm tra tọa độ GPS của thành viên có nằm trong bán kính <= 300m của điểm đến không."""
  ```
* **Đường dẫn Import**: Luôn dùng đường dẫn tuyệt đối tính từ `app.` (khi đứng tại thư mục `backend/`):
  * ✅ Đúng: `from app.database.models import Trip, TripMember`
  * ❌ Sai: `from ..database.models import Trip`

### 3.2. Đối với Mobile Frontend (React Native / Flutter)
* **Đặt tên**:
  * Màn hình (`screens/`) và Component (`components/`): `PascalCase` (VD: `PlanPreviewScreen.tsx`, `GroupInviteSheet.tsx`).
  * Hàm xử lý sự kiện và biến state: `camelCase` (VD: `handleApplyTrip`, `isUnreadNotice`).
* **Quản lý Theme & API**:
  * Tuyệt đối không gõ cứng (hardcode) địa chỉ IP/URL của Backend vào trong từng màn hình; phải gọi thông qua biến cấu hình chung trong `frontend/src/services/`.
  * Sử dụng thống nhất bảng màu thương hiệu: Xanh lá rừng đậm (`#1E3F20`), Kem ấm (`#F9F6F0`), Vàng đồng (`#D4AF37`).

---

## 4. Quy Chuẩn Giao Tiếp API & Bảo Mật (.env)

* **An toàn API Keys**:
  * **Tuyệt đối không commit file `.env` lên GitHub.**
  * Khi thêm biến môi trường mới (VD: `GEMINI_API_KEY`, `OPENWEATHER_API_KEY`), chỉ thêm tên biến rỗng vào `.env.example` và gửi key thật qua nhóm chat nội bộ.
* **Chuẩn phản hồi lỗi (Error Response)**:
  * Mọi lỗi trả về từ Backend đều tuân theo định dạng chuẩn: `{"detail": "Mô tả lỗi rõ ràng bằng tiếng Việt"}` kèm HTTP Status Code chính xác (`200` OK, `400` Bad Request, `401` Unauthorized, `403` Forbidden - Không thuộc nhóm, `404` Not Found, `429` Too Many Requests - Chặn spam AI).