import json
import logging
from typing import List, Optional, TypedDict, Dict
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import SystemMessage, HumanMessage

from src.core.llm import get_llm
from src.core.util.prompt_loader import load_prompt_section
from src.core.util.text_util import slice_text_by_anchors
from src.core.tools.task_tool import edu_task_planner_tool
from src.core.tools.db_tool import submit_outline_extraction_tool, submit_chapter_extraction_tool
from src.core.schema.outline import OutlineNode

# 配置日志
logger = logging.getLogger(__name__)

# ==========================================
# 1. 定义 Graph 状态 (Graph State)
# ==========================================

class OutlineState(TypedDict):
    document_content: str
    edu_objective: str                  
    knowledge_domain: str               
    global_background_content: Optional[str] 
    task_list: List[dict]               
    task_status: Dict[int, str]             
    all_extracted_nodes: List[OutlineNode] 
    errors: List[str]                   
    outline_id: int                     
    user_feedback: Optional[str] # 用户对计划的反馈意见
    is_plan_approved: bool      # 计划是否已通过审核



# ==========================================
# 2. 递归拍扁算法 (Flattening) - 重要修复：确保 Parent 级级传递
# ==========================================

def flatten_nodes(nodes: List[OutlineNode], parent_name: Optional[str] = None, current_level: int = 1) -> List[OutlineNode]:
    """
    将嵌套的 OutlineNode 转换为平铺列表，并手动打标 parent_name 和 level。
    """
    flat = []
    for node in nodes:
        # 1. 设置当前节点的父级与深度信息
        node.parent_name = parent_name
        node.level = current_level
        flat.append(node)
        
        # 2. 递归处理子孙
        if node.children and len(node.children) > 0:
            child_flat = flatten_nodes(node.children, parent_name=node.name, current_level=current_level + 1)
            flat.extend(child_flat)
            
        # 3. 拍扁后清空此引用，保持 Pydantic 对象干净
        node.children = []
    return flat

# ==========================================
# 3. 定义 Nodes (节点逻辑)
# ==========================================

def planning_node(state: OutlineState):
    """
    负责初次审稿并制定层级编排计划 (Section 0)
    """
    content = state["document_content"]
    llm = get_llm(streaming=False)
    llm_with_tools = llm.bind_tools([edu_task_planner_tool], tool_choice="any")
    planner_prompt = load_prompt_section("agent/outline_extraction", 0)
    
    messages = [
        SystemMessage(content=planner_prompt),
    ]
    
    # 如果有用户反馈，将其作为最新的 HumanMessage 引导模型修正
    feedback = state.get("user_feedback")
    if feedback:
        # 为了保持上下文，我们最好能带上之前的任务列表（这里简化处理，让 AI 根据反馈重制）
        messages.append(HumanMessage(content=f"这是待处理的考纲全文：\n\n{content}"))
        messages.append(HumanMessage(content=f"⚠️ 用户对之前的提取计划提出了以下反馈/要求，请根据此意见重新调整计划：\n{feedback}"))
    else:
        messages.append(HumanMessage(content=f"这是待处理的考纲全文：\n\n{content}\n\n请制定层级解析计划。"))
    
    # 容错：最多重试 3 次强制工具调用
    max_retries = 3
    retries = 0
    plan_args = None
    
    while retries < max_retries:
        # [DEBUG] print(f"\n--- [NODE: Planning] 正在制定分片计划 (第 {retries + 1} 次尝试)... ---")
        response = llm_with_tools.invoke(messages)
        
        if response.tool_calls:
            plan_args = response.tool_calls[0]["args"]
            break
        else:
            # [DEBUG] print(f"⚠️ [NODE: Planning] 模型未调用工具。原始返回截断: {response.content[:100]}...")
            if not response.content:
                response.content = "[Empty or hidden tool call attempt, retrying...]"
            # 把模型的错误输出加入对话，并强制它调用工具
            messages.append(response)
            messages.append(HumanMessage(content="你的上一次回答没有触发 edu_task_planner_tool 工具！请必须使用指定的 JSON Schema 工具接口来返回你的计划，不要直接输出纯文本。"))
            retries += 1
            
    if not plan_args:
        # [DEBUG] print("❌ [NODE: Planning] 重试 3 次后模型依然拒绝调用工具，任务终止。")
        return {
            "errors": ["模型在规划阶段连续 3 次未按规范调用工具"],
            "task_list": [],
            "task_status": {}
        }
        
    # [DEBUG] print(f"✅ [NODE: Planning] 成功制定了 {len(plan_args.get('steps', []))} 个切片任务。")
    steps = plan_args.get("steps", [])
    objective = plan_args.get("educational_objective", "提取完整的考纲知识图谱")
    domain = plan_args.get("knowledge_domain", "学科知识")
    background = plan_args.get("global_background_content", "")
    
    initial_status = {i: "pending" for i in range(len(steps))}
    
    return {
        "edu_objective": objective,
        "knowledge_domain": domain,
        "global_background_content": background,
        "task_list": steps,
        "task_status": initial_status,
        "all_extracted_nodes": [],
        "errors": [],
        "user_feedback": None, # 重置反馈
        "is_plan_approved": False
    }

def human_review_node(state: OutlineState):
    """
    [MANUAL CHECK] 人工审核节点。
    在控制台环境下会阻塞等待输入；在 Web 环境下通常会配合中断(Interrupt)使用。
    """
    print("\n" + "🔍" * 10 + " [教研审核中心] " + "🔍" * 10)
    print(f"目标学科: {state['knowledge_domain']}")
    print(f"总任务数: {len(state['task_list'])}")
    for i, task in enumerate(state['task_list']):
        print(f"  [{i+1}] {task['description']} ({task['start_anchor']} -> {task['end_anchor']})")
    
    print("-" * 40)
    user_input = input("💡 请审核以上计划 (输入 'y' 通过, 或输入修改建议): ").strip()
    
    if user_input.lower() == 'y':
        return {"is_plan_approved": True, "user_feedback": None}
    else:
        return {"is_plan_approved": False, "user_feedback": user_input}

def decide_after_review(state: OutlineState):
    """根据审核结果决定流转方向"""
    if state.get("is_plan_approved"):
        return "execution"
    return "planning"

import concurrent.futures

def _process_single_task(idx, current_task, full_text, global_txt, extraction_prompt_tpl, llm_with_tools):
    """(内部方法) 独立处理单一并发任务"""
    slice_txt = slice_text_by_anchors(full_text, current_task.get("start_anchor"), current_task.get("end_anchor"))
    target_content = f"【全局背景参考】\n{global_txt}\n\n【本章节待解析文本】\n{slice_txt}"
    
    # [DEBUG] print(f"  -> [Task {idx+1}] 开始并发解析: {current_task.get('description')}")
    
    max_retries = 3
    for attempt in range(max_retries):
        # 针对 DeepSeek 这种对对话顺序极其严谨的模型，我们采取【干净重试】策略：
        # 每次重试都启动一个全新的、无污染的对话列表，防止 tool_calls 序列冲突导致 400 错误。
        messages = [
            SystemMessage(content=extraction_prompt_tpl),
            HumanMessage(content=f"请通过 submit_chapter_extraction 提交该章节的嵌套知识树：\n\n{target_content}")
        ]
        
        try:
            response = llm_with_tools.invoke(messages)
            
            # 如果成功调用工具，直接破而后立
            if response.tool_calls:
                # 注意：现在 LLM 直接传参给 submit_chapter_extraction，即 args 就是属性字典
                raw_node_data = response.tool_calls[0]["args"]
                root_obj = OutlineNode(**raw_node_data)
                
                # 开始拍扁流程 (这里只传一个 root 列表)
                flat_nodes = flatten_nodes([root_obj])
                return idx, flat_nodes, "completed", None
                
            # 否则记录警告并重新开始一个循环
            # [DEBUG] print(f"  ⚠️ [Task {idx+1}] 第 {attempt+1} 次尝试未触发工具，正在发起干净重试...")
            
        except Exception as e:
            # 如果是 API 内部报错（比如 429 频率限制），我们也给予重试机会
            # [DEBUG] print(f"  ❌ [Task {idx+1}] 第 {attempt+1} 次请求异常: {str(e)}")
            continue
            
    # 3次依然不合作则彻底挫败
    return idx, [], "failed", f"任务 {idx+1} 连续 3 次尝试（含干净重试）均未获得可用解析"

def execution_node(state: OutlineState):
    """
    负责执行解析具体任务切片 (Section 1) - 并发提取所有 pending 任务
    """
    task_list = state["task_list"]
    task_status = state["task_status"].copy()
    full_text = state["document_content"]
    
    # 寻找所有的待处理任务
    pending_items = [(i, task_list[i]) for i, s in task_status.items() if s == "pending"]
    if not pending_items: return {}
    
    # [DEBUG] print(f"\n--- [NODE: Execution] 开启并发提取，共侦测到 {len(pending_items)} 个 Pending 任务 ---")
    
    global_txt = state.get("global_background_content") or ""
    
    llm = get_llm(streaming=False)
    llm_with_tools = llm.bind_tools([submit_chapter_extraction_tool])
    extraction_prompt_tpl = load_prompt_section("agent/outline_extraction", 1)
    
    collected_nodes = []
    error_logs = []
    
    # 使用线程池并发请求大模型
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(
                _process_single_task, 
                idx, task, full_text, global_txt, extraction_prompt_tpl, llm_with_tools
            ): idx for idx, task in pending_items
        }
        
        for future in concurrent.futures.as_completed(futures):
            idx, flat_nodes, status, err_msg = future.result()
            task_status[idx] = status # 更新特定任务的状态
            if err_msg:
                error_logs.append(err_msg)
                # [DEBUG] print(f"  ❌ [Task {idx+1}] 失败: {err_msg}")
            else:
                collected_nodes.extend(flat_nodes)
                # [DEBUG] print(f"  ✅ [Task {idx+1}] 提取成功, 收获 {len(flat_nodes)} 个节点")
                
    # 汇总所有的成功节点
    new_nodes = state.get("all_extracted_nodes", []) + collected_nodes
    current_errors = state.get("errors", []) + error_logs
    
    return {
        "all_extracted_nodes": new_nodes,
        "task_status": task_status,
        "errors": current_errors
    }

def persistence_node(state: OutlineState):
    """
    负责将所有累积的扁平化节点持久化到数据库 (最后一步)
    """
    # 【安全阀门】：检查是否所有的任务都处于 completed 状态
    task_status_values = list(state.get("task_status", {}).values())
    # 如果此时还有 pending，或者存在 error / failed，则说明有残缺
    if any(s != "completed" for s in task_status_values) or state.get("errors"):
        err_msg = "🚨 安全拦截：检测到存在解析失败或出错的章节。为保证图谱完整性，本次运行拒绝入库。请重试或检查日志。"
        # [DEBUG] print(f"\n{err_msg}")
        return {"errors": state.get("errors", []) + [err_msg]}
        
    all_nodes = state.get("all_extracted_nodes", [])
    if not all_nodes:
        return {"errors": state.get("errors", []) + ["无任何成功提取的节点可供入库"]}
        
    # [DEBUG] print(f"\n--- [NODE: Persistence] 开始持久化 {len(all_nodes)} 个节点 ---")
    
    # 将模型 Pydantic 类型转化为 tool 所需格式直接调用
    try:
        # 获取大纲元信息
        outline_name = state.get("knowledge_domain") or "未命名的考纲"
        outline_desc = state.get("edu_objective") or "由 Agent 自动解析"
        
        # 批量原子入库
        result_msg = submit_outline_extraction_tool.invoke({
            "nodes": all_nodes, 
            "name": outline_name, 
            "description": outline_desc
        })
        # [DEBUG] print(f"📌 持久化结果: {result_msg}")
        return {} 
    except Exception as e:
        # [DEBUG] print(f"❌ 持久化失败: {str(e)}")
        return {"errors": state.get("errors", []) + [f"持久化报错: {str(e)}"]}

def should_continue(state: OutlineState):
    """判断是否还有任务 pending"""
    if any(s == "pending" for s in state.get("task_status", {}).values()):
        return "execution"
    return "persistence" # 当没有 pending 时，进入入库环节

def build_outline_agent():
    """构建【规划 -> 审核 -> 递归提取 -> 持久化】LangGraph 工作流"""
    workflow = StateGraph(OutlineState)
    workflow.add_node("planning", planning_node)
    workflow.add_node("human_review", human_review_node)
    workflow.add_node("execution", execution_node)
    workflow.add_node("persistence", persistence_node)
    
    workflow.add_edge(START, "planning")
    workflow.add_edge("planning", "human_review")
    
    # 核心闭环：审核节点决定是去执行还是重修
    workflow.add_conditional_edges(
        "human_review", 
        decide_after_review,
        {
            "execution": "execution",
            "planning": "planning"
        }
    )
    
    # execution 完成单步后，通过 conditional edge 判断是继续执行还是前往入库
    workflow.add_conditional_edges("execution", should_continue)
    
    # 最终入库节点直通结束
    workflow.add_edge("persistence", END)
    
    return workflow.compile()

async def run_outline_extraction_stream(content: str, outline_id: int = 1):
    """
    【流式主入口】
    针对给定的考纲全文内容，启动解析流水线，并产生实时的状态更新流。
    
    Yields:
        dict: 包含当前步骤、任务状态、已提取节点数、错误信息等的字典。
    """
    initial_state = {
        "document_content": content,
        "task_list": [],
        "task_status": {},
        "all_extracted_nodes": [],
        "errors": [],
        "outline_id": outline_id,
        "user_feedback": None,
        "is_plan_approved": False,
        "global_background_content": None
    }
    
    app = build_outline_agent()
    
    # 使用 astream 监听 LangGraph 的每一个 step 变化
    async for event in app.astream(initial_state):
        # event 的 Key 是对应的 Node Name (planning, execution, persistence)
        node_name = list(event.keys())[0]
        state_snapshot = event[node_name]
        
        # 补全容错：如果 Snapshot 为空，则拿全量状态（通常在某些边或 Final 节点发生）
        if state_snapshot is None:
            continue
            
        # 封装一个对用户友好的状态包
        yield {
            "step": node_name,
            "tasks": state_snapshot.get("task_status", {}),
            "node_count": len(state_snapshot.get("all_extracted_nodes", [])),
            "errors": state_snapshot.get("errors", []),
            "snapshot": state_snapshot
        }