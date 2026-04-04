import os
import json
from core.utils.agent.task_util import format_task_list_to_md

current_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(current_dir, "..", "..", "test_data", "agent", "outline", "planing_node.json")

print(f"[DEBUG] loading data from: {data_path}")

with open(data_path, "r", encoding="utf-8") as f:
    task_list = json.load(f)

print(format_task_list_to_md(task_list.get("steps", [])))
