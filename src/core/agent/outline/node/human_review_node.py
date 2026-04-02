import logging
from src.core.agent.outline.state import OutlineState
from src.services.outline.agent_manager import agent_manager

logger = logging.getLogger(__name__)

async def human_review_node(state: OutlineState):
    outline_id = state.get("outline_id")
    
    # 构造待审阅的状态输出包
    # 我们一定要在 wait() 之前把这个信号推进队列，否则流就被阻塞了
    review_packet = {
        "step": "human_review",
        "is_awaiting_review": True,
        "outline_id": outline_id, # 这里一定要传，前端反馈需要引用
        "plan": state['task_list'],
        "node_count": len(state.get('all_extracted_nodes', [])),
        "tasks": state.get('task_status', {})
    }

    await agent_manager.push_message(outline_id, review_packet)

    logger.info(f"Agent {outline_id} waiting for web review...")
    event = agent_manager.get_event(outline_id)
    await event.wait()
    
    user_input = agent_manager.feedbacks.get(outline_id, "y").strip().lower()
    agent_manager.clear_feedback(outline_id)

    if user_input == 'y':
        return {"is_plan_approved": True, "user_feedback": None}
    else:
        return {"is_plan_approved": False, "user_feedback": user_input}
