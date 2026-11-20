import csv
import json
import re
from pathlib import Path
import pytest

RAW_DATA_DIR = Path(__file__).resolve().parents[1] / "app" / "database" / "raw_data"
VALID_CATEGORIES = {"hotel", "food", "attraction", "culture"}
TIME_PATTERN = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")

REQUIRED_FIELDS = [
    "name",
    "city",
    "category",
    "address",
    "latitude",
    "longitude",
    "open_time",
    "close_time",
    "avg_duration_mins",
    "ticket_price",
    "is_indoor",
    "tags",
]


def load_all_raw_places():
    """Đọc toàn bộ bản ghi từ các file JSON/CSV trong raw_data/."""
    records = []
    if not RAW_DATA_DIR.exists():
        return records

    for file_path in RAW_DATA_DIR.iterdir():
        if file_path.suffix == ".json":
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for idx, item in enumerate(data):
                    records.append((file_path.name, idx, item))
        elif file_path.suffix == ".csv":
            with open(file_path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                for idx, item in enumerate(reader):
                    records.append((file_path.name, idx, item))
    return records


def test_raw_data_directory_has_files():
    assert RAW_DATA_DIR.exists(), f"Không tìm thấy thư mục {RAW_DATA_DIR}"
    records = load_all_raw_places()
    assert len(records) > 0, "Thư mục raw_data/ chưa có dữ liệu địa điểm nào!"


@pytest.mark.parametrize("filename,idx,place", load_all_raw_places())
def test_place_record_integrity(filename, idx, place):
    ctx = f"[{filename} - dòng/item #{idx} - {place.get('name', 'UNKNOWN')}]"

    # 1. Không khuyết trường bắt buộc
    for field in REQUIRED_FIELDS:
        assert field in place and place[field] not in (None, ""), f"{ctx} Thiếu trường '{field}'"

    # 2. Kiểm tra category đúng chuẩn ORM (hotel/food/attraction/culture)
    assert place["category"] in VALID_CATEGORIES, f"{ctx} Category không hợp lệ: {place['category']}"

    # 3. Kiểm tra tọa độ GPS hợp lệ (Phạm vi Việt Nam: lat 8..24, lng 102..110)
    lat = float(place["latitude"])
    lng = float(place["longitude"])
    assert 8.0 <= lat <= 24.0, f"{ctx} Vĩ độ (latitude) ngoài phạm vi VN: {lat}"
    assert 102.0 <= lng <= 110.0, f"{ctx} Kinh độ (longitude) ngoài phạm vi VN: {lng}"

    # 4. Kiểm tra định dạng giờ mở/đóng cửa (HH:MM)
    open_t = str(place["open_time"]).strip()
    close_t = str(place["close_time"]).strip()
    assert TIME_PATTERN.match(open_t), f"{ctx} Sai định dạng open_time: {open_t}"
    assert TIME_PATTERN.match(close_t), f"{ctx} Sai định dạng close_time: {close_t}"

    # 5. Kiểm tra giá vé & thời lượng tham quan
    price = float(place["ticket_price"])
    duration = int(place["avg_duration_mins"])
    assert price >= 0, f"{ctx} Giá vé âm: {price}"
    assert duration > 0, f"{ctx} Thời lượng tham quan phải > 0: {duration}"

    # 6. Kiểm tra tags không rỗng
    tags = place["tags"]
    if isinstance(tags, str):
        tags = json.loads(tags) if tags.startswith("[") else [t.strip() for t in tags.split(",") if t.strip()]
    assert isinstance(tags, list) and len(tags) > 0, f"{ctx} Trường tags bị rỗng"