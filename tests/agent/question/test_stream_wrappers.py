import json
from types import SimpleNamespace

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.core.agent.question.generate.generate_agent import GenerateAgentSDK
from src.db.base import Base
from src.db.models import Outline, User
from src.services.question import agent as question_agent_api


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


async def collect_sse_messages(body_iterator) -> list[dict[str, object]]:
    messages = []
    async for chunk in body_iterator:
        if isinstance(chunk, bytes):
            chunk = chunk.decode()
        messages.append(parse_sse_message(chunk))
    return messages


def test_question_extraction_stream_wraps_mocked_agent_events(monkeypatch, tmp_path):
    db_path = tmp_path / "question_stream.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    async def fake_question_stream(content: str, outline_id: int, question_type: str):
        assert content == "raw exam text"
        assert outline_id == 9
        assert question_type == "单选题"
        yield {
            "step": "slicing",
            "count": 2,
            "total_chunks": 3,
            "processed_chunks": 1,
            "db_response": "saved",
            "errors": [],
        }

    async def run_test():
        db = TestingSessionLocal()
        db.add(Outline(id=9, name="Mock outline", teacher_id=42))
        db.commit()
        user = User(
            id=42,
            email="teacher@example.com",
            hashed_password="unused",
            role="teacher",
            is_active=True,
            is_superuser=False,
            is_verified=True,
        )
        monkeypatch.setattr(
            question_agent_api,
            "run_question_extraction_stream",
            fake_question_stream,
        )

        try:
            response = await question_agent_api.extract_questions(
                content="raw exam text",
                outline_id=9,
                type="单选题",
                db=db,
                user=user,
            )

            messages = await collect_sse_messages(response.body_iterator)
        finally:
            db.close()

        assert [message["event"] for message in messages] == ["progress", "done"]
        assert messages[0]["data"] == {
            "run_id": messages[0]["data"]["run_id"],  # type: ignore[index]
            "seq": 1,
            "outline_id": 9,
            "step": "slicing",
            "count": 2,
            "total_chunks": 3,
            "processed_chunks": 1,
            "db_response": "saved",
            "errors": [],
        }
        assert messages[1]["data"] == {
            "run_id": messages[0]["data"]["run_id"],  # type: ignore[index]
            "seq": 2,
            "outline_id": 9,
            "ok": True,
        }

    import asyncio

    asyncio.run(run_test())


def test_generate_practice_stream_parses_mocked_langgraph_events(monkeypatch):
    class FakeApp:
        async def astream_events(self, initial_state, version: str):
            assert initial_state["node_id"] == 11
            assert initial_state["node_md"] == "# Mock node"
            assert initial_state["difficulty"] == "困难"
            assert initial_state["q_type"] == "填空题"
            assert version == "v2"
            yield {
                "event": "on_chat_model_stream",
                "metadata": {"langgraph_node": "generate"},
                "data": {"chunk": SimpleNamespace(content="题干")},
            }
            yield {
                "event": "on_chat_model_stream",
                "metadata": {"langgraph_node": "other"},
                "data": {"chunk": SimpleNamespace(content="ignored")},
            }
            yield {
                "event": "on_chat_model_stream",
                "metadata": {"langgraph_node": "generate"},
                "data": {"chunk": SimpleNamespace(content="答案")},
            }

    async def run_test():
        sdk = GenerateAgentSDK.__new__(GenerateAgentSDK)
        sdk._app = FakeApp()
        monkeypatch.setattr(
            "src.core.agent.question.generate.generate_agent.normalize_node_to_md",
            lambda db, node_id: "# Mock node",
        )

        messages = []
        async for chunk in sdk.run_generate_practice_stream(
            db=None,
            node_id=11,
            difficulty="困难",
            q_type="填空题",
        ):
            messages.append(parse_sse_message(chunk))

        assert [message["event"] for message in messages] == ["token", "token", "done"]
        assert messages[0]["data"] == {
            "content": "题干",
            "run_id": messages[0]["data"]["run_id"],  # type: ignore[index]
            "seq": 1,
            "node_id": 11,
        }
        assert messages[1]["data"] == {
            "content": "答案",
            "run_id": messages[0]["data"]["run_id"],  # type: ignore[index]
            "seq": 2,
            "node_id": 11,
        }
        assert messages[2]["data"] == {
            "run_id": messages[0]["data"]["run_id"],  # type: ignore[index]
            "seq": 3,
            "node_id": 11,
            "ok": True,
        }

    import asyncio

    asyncio.run(run_test())


def test_generate_practice_stream_returns_error_when_node_missing(monkeypatch):
    async def run_test():
        sdk = GenerateAgentSDK.__new__(GenerateAgentSDK)
        sdk._app = object()
        monkeypatch.setattr(
            "src.core.agent.question.generate.generate_agent.normalize_node_to_md",
            lambda db, node_id: "",
        )

        messages = []
        async for chunk in sdk.run_generate_practice_stream(db=None, node_id=404):
            messages.append(parse_sse_message(chunk))

        assert len(messages) == 1
        assert messages[0]["event"] == "error"
        assert messages[0]["data"] == {
            "message": "未找到该知识点 (Node ID: 404)",
            "code": "NODE_NOT_FOUND",
            "recoverable": False,
            "details": {"node_id": 404},
            "run_id": messages[0]["data"]["run_id"],  # type: ignore[index]
            "seq": 1,
            "node_id": 404,
        }

    import asyncio

    asyncio.run(run_test())
