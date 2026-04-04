import asyncio
from typing import Dict, Any

class OutlineAgentManager:
    """管理 Agent 的异步审核反馈流与实时消息队列"""
    def __init__(self):
        # 存储 outline_id -> asyncio.Event (控制挂起/恢复)
        self.events: Dict[int, asyncio.Event] = {}
        # 存储 outline_id -> asyncio.Queue (发送给前端的消息流)
        self.queues: Dict[int, asyncio.Queue] = {}
        # 存储 用户反馈
        self.feedbacks: Dict[int, str] = {}

    def get_event(self, outline_id: int) -> asyncio.Event:
        if outline_id not in self.events:
            self.events[outline_id] = asyncio.Event()
        return self.events[outline_id]

    def get_queue(self, outline_id: int) -> asyncio.Queue:
        if outline_id not in self.queues:
            self.queues[outline_id] = asyncio.Queue()
        return self.queues[outline_id]

    async def push_message(self, outline_id: int, message: Any):
        """向前端队列推送消息"""
        if outline_id in self.queues:
            await self.queues[outline_id].put(message)

    def set_feedback(self, outline_id: int, feedback: str):
        """应用用户反馈，恢复挂起的 Agent"""
        self.feedbacks[outline_id] = feedback
        if outline_id in self.events:
            self.events[outline_id].set()

    def clear_feedback(self, outline_id: int):
        """只清除反馈控制相关的事件记录，保留队列流"""
        self.events.pop(outline_id, None)
        self.feedbacks.pop(outline_id, None)

    def clear_all(self, outline_id: int):
        """任务彻底结束后，清除所有关联资源"""
        self.clear_feedback(outline_id)
        self.queues.pop(outline_id, None)

agent_manager = OutlineAgentManager()

