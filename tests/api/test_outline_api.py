"""
Outline CRUD API 测试。

覆盖：GET /outlines, POST /outlines, PUT /outlines/{id}, DELETE /outlines/{id}
"""
import pytest
from tests.api.conftest import client  # noqa: F401


def test_list_outlines_empty(client):
    resp = client.get("/outlines")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_outline(client):
    payload = {"name": "考研数学一 2026", "desc": "高数+线代+概率"}
    resp = client.post("/outlines", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == payload["name"]
    assert data["id"] > 0
    assert data["node_count"] == 0


def test_get_outline(client):
    create = client.post("/outlines", json={"name": "考研英语一"})
    oid = create.json()["id"]

    resp = client.get(f"/outlines/{oid}")
    assert resp.status_code == 200
    assert resp.json()["id"] == oid


def test_get_outline_not_found(client):
    resp = client.get("/outlines/99999")
    assert resp.status_code == 404


def test_update_outline(client):
    oid = client.post("/outlines", json={"name": "初稿"}).json()["id"]

    resp = client.put(f"/outlines/{oid}", json={"name": "修改后"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "修改后"


def test_update_outline_not_found(client):
    resp = client.put("/outlines/99999", json={"name": "X"})
    assert resp.status_code == 404


def test_delete_outline(client):
    oid = client.post("/outlines", json={"name": "待删除"}).json()["id"]

    resp = client.delete(f"/outlines/{oid}")
    assert resp.status_code == 200

    # 软删除后不再出现在列表中
    resp2 = client.get("/outlines")
    ids = [o["id"] for o in resp2.json()]
    assert oid not in ids


def test_delete_outline_not_found(client):
    resp = client.delete("/outlines/99999")
    assert resp.status_code == 404


def test_list_outlines_returns_created(client):
    client.post("/outlines", json={"name": "大纲 A"})
    client.post("/outlines", json={"name": "大纲 B"})
    resp = client.get("/outlines")
    assert len(resp.json()) >= 2
