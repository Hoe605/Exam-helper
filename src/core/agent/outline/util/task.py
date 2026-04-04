from typing import List

def format_task_list_to_md(task_list: List[dict]) -> str:
    """
    将任务列表格式化为 Markdown 表格格式，用于人工审核。
    """
    if not task_list:
        return "无任务。"
    
    # 定义表头
    header_map = {
        "step_id": "步骤",
        "description": "任务描述",
        "start_anchor": "起始锚点",
        "end_anchor": "结束锚点"
    }
    
    # 构建表头
    header = " | ".join(header_map.values())
    separator = " | ".join(["---"] * len(header_map))
    
    # 构建行
    rows = []
    for i, task in enumerate(task_list):
        row_values = []
        # 处理 step_id，如果不存在则使用索引
        step_val = task.get("step_id") or (i + 1)
        row_values.append(f"第 {step_val} 步")
        
        # 其他字段
        row_values.append(str(task.get("description", "")))
        row_values.append(str(task.get("start_anchor", "")))
        row_values.append(str(task.get("end_anchor", "")))
        
        rows.append("| " + " | ".join(row_values) + " |")
    
    return f"| {header} |\n| {separator} |\n" + "\n".join(rows)
