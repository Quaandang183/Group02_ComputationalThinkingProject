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
