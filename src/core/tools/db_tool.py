import json
from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool

# 复用 Agent 中定义的数据结构或在此抽象
class DryRunNode(BaseModel):
    name: str
    level: int
    parent_name: Optional[str] = None
    desc: Optional[str] = None

@tool("db_upsert_outline_nodes")
def db_upsert_outline_nodes_tool(outline_title: str, nodes: List[dict]) -> str:
    """
    【数据模拟入库工具】。
    用于将解析出的结构化大纲节点持久化到数据库。
    
    注意：当前阶段仅执行 Dry-run 模式，会将节点层级结构打印至日志进行预览校对。
    
    Args:
        outline_title: 大纲/试卷的总标题 (例如: '2026考研数学一')
        nodes: 提取出的 OutlineNode 列表数据
    """
    print("\n" + "🚀" * 15)
    print(f" [DB DRY-RUN] 正在模拟入库流程")
    print(f" 目标大纲: {outline_title}")
    print(f" 总节点数: {len(nodes)}")
    print("-" * 30)
    
    # 模拟简单的树形层级打印
    for i, node in enumerate(nodes, 1):
        indent = "  " * (node.get('level', 1) - 1)
        parent_info = f" [父节点: {node['parent_name']}]" if node.get('parent_name') else " [根节点]"
        print(f"{indent}└─ [{node.get('level')}] {node.get('name')}{parent_info}")
        if node.get('desc'):
            print(f"{indent}    ℹ️ 描述: {node['desc'][:50]}..." if len(node['desc']) > 50 else f"{indent}    ℹ️ 描述: {node['desc']}")

    print("🚀" * 15 + "\n")
    
    return f"模拟入库成功：已在控制台预览 {len(nodes)} 个节点的层级映射。建议校验 parent_name 的一致性。"
