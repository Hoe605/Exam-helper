from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.core.agent.outline.schema.outline import OutlineNode
from src.core.agent.outline.service import outline as outline_service
from src.db.base import Base
from src.db.models import Node, Outline


def test_save_outline_to_existing_outline(monkeypatch, tmp_path):
    db_path = tmp_path / "outline.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSessionLocal() as db:
        existing_outline = Outline(name="占位大纲", desc="AI Generating...")
        db.add(existing_outline)
        db.commit()
        db.refresh(existing_outline)
        outline_id = existing_outline.id

    monkeypatch.setattr(outline_service, "SessionLocal", TestingSessionLocal)

    nodes = [
        OutlineNode(name="第一章", description="章描述", level=1),
        OutlineNode(name="第一节", description="节描述", parent_name="第一章", level=2),
    ]

    result = outline_service.save_outline_to_db(
        nodes,
        name="数学大纲",
        description="自动解析完成",
        outline_id=outline_id,
    )

    assert f"ID: {outline_id}" in result

    with TestingSessionLocal() as db:
        outlines = db.query(Outline).all()
        assert len(outlines) == 1
        assert outlines[0].id == outline_id
        assert outlines[0].name == "数学大纲"
        assert outlines[0].desc == "自动解析完成"

        persisted_nodes = db.query(Node).order_by(Node.level).all()
        assert len(persisted_nodes) == 2
        assert {node.outline_id for node in persisted_nodes} == {outline_id}

        root = next(node for node in persisted_nodes if node.name == "第一章")
        child = next(node for node in persisted_nodes if node.name == "第一节")
        assert child.f_node == root.id
