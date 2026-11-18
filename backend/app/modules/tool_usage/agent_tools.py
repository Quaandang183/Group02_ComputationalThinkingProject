"""TripWise tool declarations and dispatch for Maps, Weather, and Places."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import date
from typing import Annotated, Any, Literal, Protocol

from pydantic import BaseModel, ConfigDict, Field, JsonValue, model_validator

from app.modules.planning.json_schemas import PlaceSearchRequest

Latitude = Annotated[float, Field(ge=-90, le=90, allow_inf_nan=False)]
Longitude = Annotated[float, Field(ge=-180, le=180, allow_inf_nan=False)]
ToolName = Literal["search_places", "get_weather", "get_route"]


class ToolArguments(BaseModel):
    """Reject undeclared fields and values of the wrong type."""

    model_config = ConfigDict(extra="forbid", strict=True)


class Coordinates(ToolArguments):
    """A point in latitude/longitude degrees."""

    lat: Latitude
    lng: Longitude


class WeatherArgs(ToolArguments):
    """Request weather at a point for an inclusive local date range."""

    location: Coordinates
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_date_range(self) -> "WeatherArgs":
        """Reject reversed dates and requests longer than 16 days."""
        if not 0 <= (self.end_date - self.start_date).days < 16:
            raise ValueError("Weather dates must span 1–16 days in chronological order")
        return self


class RouteArgs(ToolArguments):
    """Request a distance and travel time between two points."""

    origin: Coordinates
    destination: Coordinates
    mode: Literal["driving", "walking", "cycling"]


@dataclass(frozen=True)
class ToolSpec:
    """A model-facing description and its validated input model."""

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
    """Return function declarations for the LLM adapter to register."""
    return [
        {"name": name, "description": spec.description, "parameters": spec.arguments.model_json_schema()}
        for name, spec in TOOLS.items()
    ]


class ToolCall(ToolArguments):
    """Normalized model output for one function call."""

    id: Annotated[str, Field(min_length=1, max_length=128)]
    name: ToolName
    arguments_json: Annotated[str, Field(min_length=2, max_length=12_000)]


class ToolResult(ToolArguments):
    """JSON result paired with its original function call."""

    call: ToolCall
    data: JsonValue


class AgentTurn(ToolArguments):
    """The model either requests tools or returns a final answer."""

    calls: list[ToolCall] = Field(default_factory=list, max_length=3)
    answer: str | None = None

    @model_validator(mode="after")
    def validate_turn(self) -> "AgentTurn":
        """Reject turns with neither an answer nor calls, or with both."""
        if self.calls and self.answer is not None:
            raise ValueError("Return either tool calls or an answer")
        if not self.calls and (self.answer is None or not self.answer.strip()):
            raise ValueError("A turn without tool calls needs a final answer")
        return self


class ChooseTurn(Protocol):
    """Adapter that asks a model to choose a tool or answer from prior results."""

    def __call__(
        self, question: str, schemas: list[dict[str, Any]], results: tuple[ToolResult, ...]
    ) -> Awaitable[AgentTurn]:
        """Return the next model turn."""
        ...


@dataclass(frozen=True)
class ToolServices:
    """The backend supplies async handlers that return JSON-ready data."""

    search_places: Callable[[PlaceSearchRequest], Awaitable[JsonValue]]
    get_weather: Callable[[WeatherArgs], Awaitable[JsonValue]]
    get_route: Callable[[RouteArgs], Awaitable[JsonValue]]


async def execute_tool(call: ToolCall, services: ToolServices) -> ToolResult:
    """Validate model arguments before invoking the selected service."""
    if call.name == "search_places":
        data = await services.search_places(PlaceSearchRequest.model_validate_json(call.arguments_json))
    elif call.name == "get_weather":
        data = await services.get_weather(WeatherArgs.model_validate_json(call.arguments_json))
    elif call.name == "get_route":
        data = await services.get_route(RouteArgs.model_validate_json(call.arguments_json))
    else:
        raise ValueError(f"Unknown tool: {call.name}")
    return ToolResult(call=call, data=data)


async def run_tool_agent(question: str, choose_turn: ChooseTurn, services: ToolServices) -> str:
    """Feed validated tool results back to the model, with up to six calls."""
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
