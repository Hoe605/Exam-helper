import json

from src.core.streaming import (
    STREAM_EVENT_DONE,
    STREAM_EVENT_PROGRESS,
    STREAM_EVENT_TOKEN,
    StreamRun,
    sse_done,
    sse_event,
    sse_progress,
    sse_token,
)


def parse_sse_message(message: str) -> dict[str, object]:
    fields: dict[str, object] = {"data": []}
    for line in message.strip().splitlines():
        field, _, value = line.partition(":")
        if value.startswith(" "):
            value = value[1:]
        if field == "data":
            fields["data"].append(value)  # type: ignore[union-attr]
        else:
            fields[field] = value
    fields["data"] = json.loads("\n".join(fields["data"]))  # type: ignore[arg-type]
    return fields


def test_sse_event_encodes_json_payload_and_metadata():
    message = sse_event(
        STREAM_EVENT_PROGRESS,
        {"message": "第一行\n第二行", "count": 2},
        event_id="outline-1:2",
        retry=1000,
    )

    fields = parse_sse_message(message)

    assert fields["id"] == "outline-1:2"
    assert fields["event"] == STREAM_EVENT_PROGRESS
    assert fields["retry"] == "1000"
    assert fields["data"] == {"message": "第一行\n第二行", "count": 2}


def test_sse_helpers_use_shared_event_names():
    progress = parse_sse_message(sse_progress({"step": "slicer", "count": 1}))
    token = parse_sse_message(sse_token("hello"))
    done = parse_sse_message(sse_done())

    assert progress["event"] == STREAM_EVENT_PROGRESS
    assert progress["data"] == {"step": "slicer", "count": 1}
    assert token["event"] == STREAM_EVENT_TOKEN
    assert token["data"] == {"content": "hello"}
    assert done["event"] == STREAM_EVENT_DONE
    assert done["data"] == {"ok": True}


def test_stream_run_adds_stable_run_metadata_and_sequence():
    stream = StreamRun(resource_ids={"outline_id": 42}, run_id="test-run")

    progress = parse_sse_message(stream.progress({"step": "planner"}))
    review = parse_sse_message(stream.review_required({"is_awaiting_review": True}))
    done = parse_sse_message(stream.done())

    assert progress["data"] == {
        "run_id": "test-run",
        "seq": 1,
        "outline_id": 42,
        "step": "planner",
    }
    assert review["data"] == {
        "run_id": "test-run",
        "seq": 2,
        "outline_id": 42,
        "is_awaiting_review": True,
    }
    assert done["data"] == {
        "run_id": "test-run",
        "seq": 3,
        "outline_id": 42,
        "ok": True,
    }
