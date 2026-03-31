from src.core.agent.outline.util.task import format_task_list_to_md
from src.core.agent.outline.state import OutlineState

def human_review_node(state: OutlineState) :
    """
    [MANUAL CHECK] 人工审核节点。
    在控制台环境下会阻塞等待输入；在 Web 环境下通常会配合中断(Interrupt)使用。
    """
    print("\n" + "🔍" * 10 + " [教研审核中心] " + "🔍" * 10)
    print(f"目标学科: {state['knowledge_domain']}")
    print(f"总任务数: {len(state['task_list'])}")
    
    # 使用新抽离的 Table 工具展示
    print(format_task_list_to_md(state['task_list']))
    
    print("-" * 40)
    user_input = input("💡 请审核以上计划 (输入 'y' 通过, 或输入修改建议): ").strip()
    
    if user_input.lower() == 'y':
        return {"is_plan_approved": True, "user_feedback": None}
    else:
        return {"is_plan_approved": False, "user_feedback": user_input}
