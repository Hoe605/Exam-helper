import json
from typing import Any, Optional

from fastapi.encoders import jsonable_encoder


def sse_event(
    event: str,
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


def sse_done(data: Any = None) -> str:
    return sse_event("done", data or {"ok": True})


def sse_error(message: str, **extra: Any) -> str:
    return sse_event("error", {"message": message, **extra})
