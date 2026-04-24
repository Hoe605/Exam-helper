import json
from pathlib import Path
import pytest


@pytest.mark.deep
def test_json_to_db_persistence():
    source_file = Path.cwd() / "files" / "1.json"
    if not source_file.exists():
        pytest.skip("缺少 files/1.json，跳过深度入库测试。")

    from src.core.agent.outline.tool import submit_outline_extraction_tool
    from src.core.agent.outline.schema.outline import OutlineNode
    from src.core.agent.outline.util.node import flatten_outline_tree

    raw_data = json.loads(source_file.read_text(encoding="utf-8"))
    nodes_data = raw_data[0]["args"]["nodes"] if isinstance(raw_data, list) and "args" in raw_data[0] else raw_data
    flat_data = flatten_outline_tree(nodes_data)

    nodes = [
        OutlineNode(
            name=item["name"],
            description=item.get("description"),
            parent_name=item.get("parent_name"),
            level=item.get("level", 1),
        )
        for item in flat_data
    ]

    result = submit_outline_extraction_tool.invoke({"nodes": nodes})
    assert result is not None
