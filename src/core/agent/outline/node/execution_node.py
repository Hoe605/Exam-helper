import logging
import concurrent.futures
from langchain_core.messages import SystemMessage, HumanMessage
from src.core.llm import get_llm
from src.core.utils.agent.prompt_loader import load_prompt_section
from src.core.agent.outline.util.text import slice_text_by_anchors
from src.core.agent.outline.util.node import flatten_nodes
from src.core.agent.outline.tool import (
    submit_chapter_extraction_tool
)
from src.core.agent.outline.schema.outline import OutlineNode
from src.core.agent.outline.state import OutlineState

logger = logging.getLogger(__name__)

def _process_single_task(idx , current_task, full_text, global_txt, extraction_prompt_tpl, llm_with_tools):
    """(内部方法) 独立处理单一并发任务"""
    slice_txt = slice_text_by_anchors(full_text, current_task.get("start_anchor"), current_task.get("end_anchor"))
    target_content = f"【任务描述】\n{current_task.get('description')}\n\n【全局背景参考】\n{global_txt}\n\n【本章节待解析文本】\n{slice_txt}"
    
    max_retries = 3
    for attempt in range(max_retries):
        messages = [
            SystemMessage(content=extraction_prompt_tpl),
            HumanMessage(content=f"请通过 submit_chapter_extraction 提交该章节的嵌套知识树：\n\n{target_content}")
        ]

        response = llm_with_tools.invoke(messages)

        if response.tool_calls:
            # 只有在获取到合规的工具调用参数后，再构造 OutlineNode
            raw_node_data = response.tool_calls[0]["args"]
            root_obj = OutlineNode(**raw_node_data)
            print(f"任务 {idx+1} 解析完成")
            return idx, root_obj, "completed", None

    return idx, None, "failed", f"任务 {idx+1} 连续 3 次尝试（含干净重试）均未获得可用解析"

def exe_node(state: OutlineState):
    """
    负责执行解析具体任务切片 (Section 1) - 改为【单步执行】以支持流式进度监听
    """
    task_list = state["task_list"]
    task_status = state["task_status"].copy()
    full_text = state["document_content"]
    global_txt = state.get("global_background_content") or ""
    
    # 找到第一个待处理任务，确保取到的是 task_list 中的对象
    pending_items = [(int(i), task_list[int(i)]) for i, status in task_status.items() if status == "pending"]
    if not pending_items:
        logger.info("所有大纲提取任务已完成")
        return {}
    
    idx, current_task = pending_items[0]
    
    llm = get_llm(streaming=False)
    llm_with_tools = llm.bind_tools([submit_chapter_extraction_tool] , tool_choice="submit_chapter_extraction")
    extraction_prompt_tpl = load_prompt_section("agent/outline_extraction", 1)
    
    collected_roots = []
    error_logs = []

    logger.info("正在执行原子提取任务: %d/%d", idx + 1, len(task_list))
    
    # 执行单步任务逻辑 (复用之前的私有处理函数逻辑)
    _, root_obj, status, err_msg = _process_single_task(
        idx, current_task, full_text, global_txt, extraction_prompt_tpl, llm_with_tools
    )
    
    task_status[idx] = status
    if err_msg:
        error_logs.append(err_msg)
    elif root_obj:
        collected_roots.append(root_obj)
    
    total_roots = state.get("all_extracted_nodes", []) + collected_roots
    current_errors = state.get("errors", []) + error_logs
    
    return {
        "all_extracted_nodes": total_roots,
        "task_status": task_status,
        "errors": current_errors
    }
