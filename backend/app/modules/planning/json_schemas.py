"""JSON contract for the TripWise place recommendation flow."""

from collections.abc import Collection
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator


PlaceId = Annotated[str, StringConstraints(min_length=1, max_length=64, pattern=r"\S")]
ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
PlaceCity = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
PlaceCategory = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class PlaceSearchRequest(BaseModel):
    """Validate the JSON sent by the backend for a place search."""

    model_config = ConfigDict(extra="forbid", strict=True)

    query: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1000)]
    city: PlaceCity
    category: PlaceCategory | None = None
    preferences: list[ShortText] = Field(max_length=20)
    limit: int = Field(ge=1, le=20)


class PlaceSuggestion(BaseModel):
    """Describe a suggested place using its existing database identifier."""

    model_config = ConfigDict(extra="forbid", strict=True)

    id: PlaceId = Field(description="Exact value of Place.id from the backend candidates")
    name: ShortText
    category: PlaceCategory | None
    reason: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]


class PlaceSearchResponse(BaseModel):
    """Validate the model response; an empty list represents no match."""

    model_config = ConfigDict(extra="forbid", strict=True)

    places: list[PlaceSuggestion] = Field(max_length=20)

    @field_validator("places")
    @classmethod
    def reject_duplicate_ids(cls, places: list[PlaceSuggestion]) -> list[PlaceSuggestion]:
        """Reject repeated places in a single response."""
        if len({place.id for place in places}) != len(places):
            raise ValueError("Place IDs must be unique")
        return places


def validate_place_response(
    raw_json: str, request: PlaceSearchRequest, allowed_place_ids: Collection[str]
) -> PlaceSearchResponse:
    """Reject invalid JSON, results beyond the request limit, and unknown place IDs."""
    response = PlaceSearchResponse.model_validate_json(raw_json)
    if len(response.places) > request.limit:
        raise ValueError("The number of places exceeds the request limit")
    allowed_ids = set(allowed_place_ids)
    if any(place.id not in allowed_ids for place in response.places):
        raise ValueError("The response contains an ID outside the backend candidates")
    return response
