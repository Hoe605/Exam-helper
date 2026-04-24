"""
Question Library API 测试。

覆盖：GET /question/library, GET /question/library/{id}, DELETE /question/library/{id}
"""
import pytest
from tests.api.conftest import client, TestSessionLocal  # noqa: F401
from src.db.models import Question, Outline


def _seed_outline(context: str = "数学大纲") -> int:
    with TestSessionLocal() as s:
        outline = Outline(name=context, is_deleted=False)
        s.add(outline)
        s.commit()
        s.refresh(outline)
        return outline.id


def _seed_question(context: str = "1+1=?", outline_id: int = None) -> int:
    with TestSessionLocal() as s:
        q = Question(context=context, q_type="单选", outline_id=outline_id)
        s.add(q)
        s.commit()
        s.refresh(q)
        return q.id


def test_list_library_empty(client):
    resp = client.get("/question/library")
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "items" in data


def test_get_question_detail(client):
    qid = _seed_question()
    resp = client.get(f"/question/library/{qid}")
    assert resp.status_code == 200
    assert resp.json()["id"] == qid


def test_get_question_not_found(client):
    resp = client.get("/question/library/99999")
    assert resp.status_code == 404


def test_delete_question(client):
    qid = _seed_question()
    resp = client.delete(f"/question/library/{qid}")
    assert resp.status_code == 200

    resp2 = client.get(f"/question/library/{qid}")
    assert resp2.status_code == 404


def test_delete_question_not_found(client):
    resp = client.delete("/question/library/99999")
    assert resp.status_code == 404


def test_list_by_outline(client):
    oid = _seed_outline()
    _seed_question(context="Q1", outline_id=oid)
    _seed_question(context="Q2", outline_id=oid)

    resp = client.get("/question/library", params={"outline_id": oid})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 2
    for item in data["items"]:
        assert item["outline_id"] == oid
