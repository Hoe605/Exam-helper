import json
from dataclasses import dataclass, field
from uuid import uuid4
from typing import Any, Final, NotRequired, Optional, TypeAlias, TypedDict

from fastapi.encoders import jsonable_encoder

STREAM_EVENT_PROGRESS: Final = "progress"
STREAM_EVENT_TOKEN: Final = "token"
STREAM_EVENT_REVIEW_REQUIRED: Final = "review_required"
STREAM_EVENT_ERROR: Final = "error"
STREAM_EVENT_DONE: Final = "done"

StreamEventName: TypeAlias = str


class StreamErrorPayload(TypedDict, total=False):
    run_id: str
    seq: int
    outline_id: NotRequired[int]
    node_id: NotRequired[int]
    message: str
    code: NotRequired[str]
    recoverable: NotRequired[bool]
    details: NotRequired[dict[str, Any]]


class StreamDonePayload(TypedDict, total=False):
    run_id: str
    seq: int
    outline_id: NotRequired[int]
    node_id: NotRequired[int]
    ok: bool


class TokenStreamPayload(TypedDict, total=False):
    run_id: str
    seq: int
    outline_id: NotRequired[int]
    node_id: NotRequired[int]
    content: str
    message: NotRequired[str]


class ProgressStreamPayload(TypedDict, total=False):
    run_id: str
    seq: int
    outline_id: NotRequired[int]
    node_id: NotRequired[int]
    step: str
    count: int
    current: int
    total: int
    total_chunks: int
    processed_chunks: int
    db_response: str
    errors: list[str]
    message: str


class OutlineReviewRequiredPayload(ProgressStreamPayload, total=False):
    is_awaiting_review: bool
    outline_id: int
    plan: list[Any]
    node_count: int
    tasks: dict[str, str]
    snapshot: dict[str, Any]


def sse_event(
    event: StreamEventName,
    data: Any = None,
    *,
    event_id: Optional[str] = None,
    retry: Optional[int] = None,
) -> str:
    """Encode one Server-Sent Events message."""
    lines: list[str] = []

    if event_id is not None:
        lines.append(f"id: {event_id}")
    if event:
        lines.append(f"event: {event}")
    if retry is not None:
        lines.append(f"retry: {retry}")

    encoded = "" if data is None else json.dumps(jsonable_encoder(data), ensure_ascii=False)
    data_lines = encoded.splitlines() or [""]
    lines.extend(f"data: {line}" for line in data_lines)

    return "\n".join(lines) + "\n\n"


def sse_done(data: StreamDonePayload | None = None) -> str:
    return sse_event(STREAM_EVENT_DONE, data or {"ok": True})


def sse_error(message: str, **extra: Any) -> str:
    return sse_event(STREAM_EVENT_ERROR, {"message": message, **extra})


def sse_progress(data: ProgressStreamPayload | dict[str, Any]) -> str:
    return sse_event(STREAM_EVENT_PROGRESS, data)


def sse_token(content: str, **extra: Any) -> str:
    return sse_event(STREAM_EVENT_TOKEN, {"content": content, **extra})


def sse_review_required(data: OutlineReviewRequiredPayload | dict[str, Any]) -> str:
    return sse_event(STREAM_EVENT_REVIEW_REQUIRED, data)


@dataclass
class StreamRun:
    resource_ids: dict[str, Any] = field(default_factory=dict)
    run_id: str = field(default_factory=lambda: uuid4().hex)
    seq: int = 0

    def payload(self, data: Any = None) -> dict[str, Any]:
        self.seq += 1
        base = {"run_id": self.run_id, "seq": self.seq, **self.resource_ids}
        if data is None:
            return base
        if isinstance(data, dict):
            return {**base, **data}
        return {**base, "value": data}

    def progress(self, data: ProgressStreamPayload | dict[str, Any]) -> str:
        return sse_progress(self.payload(data))

    def token(self, content: str, **extra: Any) -> str:
        return sse_token(content, **self.payload(extra))

    def review_required(self, data: OutlineReviewRequiredPayload | dict[str, Any]) -> str:
        return sse_review_required(self.payload(data))

    def error(self, message: str, **extra: Any) -> str:
        return sse_error(message, **self.payload(extra))

    def done(self, data: StreamDonePayload | None = None) -> str:
        return sse_done(self.payload(data or {"ok": True}))
