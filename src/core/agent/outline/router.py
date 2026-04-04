from .state import OutlineState

def decide_after_review(state: OutlineState):
    """根据审核结果决定流转方向"""
    if state.get("is_plan_approved"):
        return "execution"
    return "planning"

def should_continue(state: OutlineState):
    """判断是否还有任务 pending"""
    if any(s == "pending" for s in state.get("task_status", {}).values()):
        return "execution"
    return "persistence" # 当没有 pending 时，进入入库环节
