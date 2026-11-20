"""
TRIPWISE - Khai báo và điều phối công cụ AI (agent_tools.py)
"""

from collections.abc import Awaitable, Callable, Mapping
from dataclasses import dataclass
from datetime import date
from typing import Annotated, Any, Literal, Protocol

from pydantic import BaseModel, ConfigDict, Field, JsonValue, model_validator

from app.modules.planning.json_schemas import PlaceId, PlaceSearchRequest, ShortText

Latitude = Annotated[float, Field(ge=-90, le=90, allow_inf_nan=False)]
Longitude = Annotated[float, Field(ge=-180, le=180, allow_inf_nan=False)]
ToolName = Literal["search_places", "get_weather", "get_route"]


# ==============================================================================
# 1. DỮ LIỆU ĐẦU VÀO VÀ KẾT QUẢ CÔNG CỤ
# ==============================================================================
class ToolArguments(BaseModel):
    """Từ chối trường ngoài khai báo và giá trị sai kiểu."""

    model_config = ConfigDict(extra="forbid", strict=True)


class Coordinates(ToolArguments):
    """Tọa độ một điểm theo vĩ độ và kinh độ."""

    latitude: Latitude
    longitude: Longitude


class PlaceCandidate(BaseModel):
    """Dữ liệu địa điểm cung cấp cho AI theo tên trường của ORM."""

    model_config = ConfigDict(from_attributes=True, strict=True, extra="forbid")

    id: PlaceId
    name: ShortText
    city: str | None = None
    category: str | None = None
    address: str | None = None
    latitude: Latitude | None = None
    longitude: Longitude | None = None
    open_time: str | None = None
    close_time: str | None = None
    tags: list[str] | None = None

    @classmethod
    def from_nearby_row(cls, row: Mapping[str, Any]) -> "PlaceCandidate":
        """Đổi tên trường từ kết quả truy vấn địa điểm gần sang chuẩn ORM."""
        return cls(
            id=row["place_id"],
            name=row["name"],
            category=row.get("category"),
            address=row.get("address"),
            latitude=row.get("lat"),
            longitude=row.get("lng"),
        )


class PlaceToolOutput(ToolArguments):
    """Kết quả đã kiểm tra của dịch vụ tìm địa điểm."""

    places: list[PlaceCandidate] = Field(max_length=20)


class WeatherArgs(ToolArguments):
    """Yêu cầu thời tiết theo tọa độ và khoảng ngày địa phương."""

    location: Coordinates
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_date_range(self) -> "WeatherArgs":
        """Chỉ nhận khoảng từ một đến 16 ngày theo thứ tự thời gian."""
        if not 0 <= (self.end_date - self.start_date).days < 16:
            raise ValueError("Weather dates must span 1–16 days in chronological order")
        return self


class RouteArgs(ToolArguments):
    """Yêu cầu khoảng cách và thời gian di chuyển giữa hai điểm."""

    origin: Coordinates
    destination: Coordinates
    mode: Literal["driving", "walking", "cycling"]


@dataclass(frozen=True)
# ==============================================================================
# 2. DANH MỤC CÔNG CỤ CHO LLM
# ==============================================================================
class ToolSpec:
    """Mô tả công cụ và kiểu dữ liệu đầu vào."""

    description: str
    arguments: type[BaseModel]


TOOLS: dict[ToolName, ToolSpec] = {
    "search_places": ToolSpec(
        "Find places in the TripWise catalog by city, category and preferences. "
        "Preserve each backend Place.id as the result id.",
        PlaceSearchRequest,
    ),
    "get_weather": ToolSpec(
        "Get weather for known coordinates and specific YYYY-MM-DD dates. "
        "A forecast outside the provider's range is unavailable.",
        WeatherArgs,
    ),
    "get_route": ToolSpec(
        "Get route distance and estimated travel time between known coordinates.",
        RouteArgs,
    ),
}


def tool_schemas() -> list[dict[str, Any]]:
    """Trả danh sách khai báo công cụ để lớp kết nối LLM đăng ký."""
    return [
        {"name": name, "description": spec.description, "parameters": spec.arguments.model_json_schema()}
        for name, spec in TOOLS.items()
    ]


# ==============================================================================
# 3. CẤU TRÚC LƯỢT GỌI VÀ PHẢN HỒI
# ==============================================================================
class ToolCall(ToolArguments):
    """Một lượt gọi công cụ do LLM yêu cầu."""

    id: Annotated[str, Field(min_length=1, max_length=128)]
    name: ToolName
    arguments_json: Annotated[str, Field(min_length=2, max_length=12_000)]


class ToolResult(ToolArguments):
    """Kết quả JSON kèm thông tin lượt gọi tương ứng."""

    call: ToolCall
    data: JsonValue


class AgentTurn(ToolArguments):
    """Một lượt của LLM có yêu cầu gọi công cụ hoặc câu trả lời."""

    calls: list[ToolCall] = Field(default_factory=list, max_length=3)
    answer: str | None = None

    @model_validator(mode="after")
    def validate_turn(self) -> "AgentTurn":
        """Kiểm tra lượt gọi chỉ chứa công cụ hoặc câu trả lời."""
        if self.calls and self.answer is not None:
            raise ValueError("Return either tool calls or an answer")
        if not self.calls and (self.answer is None or not self.answer.strip()):
            raise ValueError("A turn without tool calls needs a final answer")
        return self


class ChooseTurn(Protocol):
    """Giao diện để LLM chọn công cụ hoặc trả lời từ kết quả trước."""

    def __call__(
        self, question: str, schemas: list[dict[str, Any]], results: tuple[ToolResult, ...]
    ) -> Awaitable[AgentTurn]:
        """Trả lượt xử lý tiếp theo của LLM."""
        ...


@dataclass(frozen=True)
# ==============================================================================
# 4. ĐIỀU PHỐI DỊCH VỤ
# ==============================================================================
class ToolServices:
    """Các hàm dịch vụ bất đồng bộ do Backend cung cấp."""

    search_places: Callable[[PlaceSearchRequest], Awaitable[PlaceToolOutput]]
    get_weather: Callable[[WeatherArgs], Awaitable[JsonValue]]
    get_route: Callable[[RouteArgs], Awaitable[JsonValue]]


async def execute_tool(call: ToolCall, services: ToolServices) -> ToolResult:
    """Kiểm tra tham số trước khi gọi dịch vụ tương ứng."""
    if call.name == "search_places":
        request = PlaceSearchRequest.model_validate_json(call.arguments_json)
        places = PlaceToolOutput.model_validate(await services.search_places(request))
        if len(places.places) > request.limit:
            raise ValueError("Places service exceeded the requested result limit")
        data = places.model_dump(mode="json")
    elif call.name == "get_weather":
        data = await services.get_weather(WeatherArgs.model_validate_json(call.arguments_json))
    elif call.name == "get_route":
        data = await services.get_route(RouteArgs.model_validate_json(call.arguments_json))
    else:
        raise ValueError(f"Unknown tool: {call.name}")
    return ToolResult(call=call, data=data)


async def run_tool_agent(question: str, choose_turn: ChooseTurn, services: ToolServices) -> str:
    """Đưa kết quả công cụ về LLM, giới hạn tối đa sáu lượt gọi công cụ."""
    results: list[ToolResult] = []
    seen_ids: set[str] = set()
    for _ in range(7):
        turn = await choose_turn(question, tool_schemas(), tuple(results))
        if turn.answer is not None:
            return turn.answer
        ids = {call.id for call in turn.calls}
        if len(ids) != len(turn.calls) or ids & seen_ids:
            raise ValueError("Tool call IDs must be unique")
        if len(results) + len(turn.calls) > 6:
            raise RuntimeError("TripWise tool call limit reached")
        seen_ids.update(ids)
        for call in turn.calls:
            results.append(await execute_tool(call, services))
    raise RuntimeError("TripWise agent did not return an answer")
