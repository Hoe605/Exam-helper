import json
from pathlib import Path
from src.core.agent.outline.util.task import format_task_list_to_md


def test_format_task_list_to_md_from_fixture():
    fixture_path = (
        Path(__file__).resolve().parents[2]
        / "test_data"
        / "agent"
        / "outline"
        / "planing_node.json"
    )
    payload = json.loads(fixture_path.read_text(encoding="utf-8"))

    markdown = format_task_list_to_md(payload.get("steps", []))

    assert "| 步骤 | 任务描述 | 起始锚点 | 结束锚点 |" in markdown
    assert "解析函数、极限和连续的知识点" in markdown
