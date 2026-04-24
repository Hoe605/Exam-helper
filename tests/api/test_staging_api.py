"""
Question Staging API 测试。

覆盖：GET /question/staging, POST (update), DELETE, stats, approve-all, reject-all
"""
import pytest
from tests.api.conftest import client  # noqa: F401


def _create_staging(context: str = "示例题干", status: str = "pending"):
    from src.db.models import QuestionStaging
    from tests.api.conftest import TestSessionLocal

    with TestSessionLocal() as session:
        item = QuestionStaging(context=context, status=status, q_type="单选")
        session.add(item)
        session.commit()
        session.refresh(item)
        return item.id


def test_list_staging_empty(client):
    resp = client.get("/question/staging")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_staging_item(client):
    iid = _create_staging()
    resp = client.get(f"/question/staging/{iid}")
    assert resp.status_code == 200
    assert resp.json()["id"] == iid


def test_get_staging_item_not_found(client):
    resp = client.get("/question/staging/99999")
    assert resp.status_code == 404


def test_staging_stats(client):
    resp = client.get("/question/staging/stats")
    assert resp.status_code == 200


def test_delete_staging_item(client):
    iid = _create_staging()
    resp = client.delete(f"/question/staging/{iid}")
    assert resp.status_code == 200

    resp2 = client.get(f"/question/staging/{iid}")
    assert resp2.status_code == 404


def test_delete_staging_not_found(client):
    resp = client.delete("/question/staging/99999")
    assert resp.status_code == 404


def test_update_staging_item(client):
    iid = _create_staging()
    resp = client.put(f"/question/staging/{iid}", json={"status": "rejected"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "rejected"


def test_reject_all(client):
    _create_staging(status="warning")
    resp = client.post("/question/staging/reject-all")
    assert resp.status_code == 200
    assert "count" in resp.json()


def test_approve_all(client):
    _create_staging(status="pending")
    resp = client.post("/question/staging/approve-all")
    assert resp.status_code == 200
    assert "count" in resp.json()
