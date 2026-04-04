from src.core.agent.outline.tool import (
    submit_outline_extraction_tool
)
from src.core.agent.outline.state import OutlineState
from src.core.agent.outline.util.node import flatten_nodes

def persistence_node(state: OutlineState):
    """
    负责将所有累积的树形节点先拍扁，然后持久化到数据库 (最后一步)
    """

    # 【安全阀门】：检查是否所有的任务都处于 completed 状态
    task_status_values = list(state.get("task_status", {}).values())
    # 如果此时还有 pending，或者存在 error / failed，则说明有残缺
    if any(s != "completed" for s in task_status_values) or state.get("errors"):
        err_msg = " 安全拦截：检测到存在解析失败或出错的章节。为保证图谱完整性，本次运行拒绝入库。请重试或检查日志。"
        # [DEBUG] print(f"\n{err_msg}")
        return {"errors": state.get("errors", []) + [err_msg]}
        
    all_roots = state.get("all_extracted_nodes", [])
    if not all_roots:
        return {"errors": state.get("errors", []) + ["无任何成功提取的节点可供入库"]}
        
    # [核心重构点]：在持久化之前，统一执行“拍扁/层级补全”逻辑
    flat_nodes = flatten_nodes(all_roots)
    
    # 将模型 Pydantic 类型转化为 tool 所需格式直接调用
    try:
        # 获取大纲元信息
        outline_name = state.get("knowledge_domain") or "未命名的考纲"
        outline_desc = state.get("edu_objective") or "由 Agent 自动解析"
        
        # 批量原子入库
        result_msg = submit_outline_extraction_tool.invoke({
            "nodes": flat_nodes, 
            "name": outline_name, 
            "description": outline_desc
        })
        # [DEBUG] print(f"📌 持久化结果: {result_msg}")
        return {} 
    except Exception as e:
        # [DEBUG] print(f"❌ 持久化失败: {str(e)}")
        return {"errors": state.get("errors", []) + [f"持久化报错: {str(e)}"]}
