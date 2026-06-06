import asyncio

from src.services.outline.agent_manager import OutlineAgentManager


async def idle_forever():
    try:
        await asyncio.Event().wait()
    except asyncio.CancelledError:
        raise


def test_cancel_task_and_clear_all_cleanup_resources():
    async def run_test():
        manager = OutlineAgentManager()
        outline_id = 123

        manager.get_queue(outline_id)
        manager.get_event(outline_id)
        manager.set_feedback(outline_id, "y")

        task = asyncio.create_task(idle_forever())
        manager.set_task(outline_id, task)

        assert manager.cancel_task(outline_id) is True
        assert outline_id not in manager.tasks
        assert task.cancelled() is False

        await asyncio.sleep(0)

        assert task.cancelled() is True

        manager.clear_all(outline_id)

        assert outline_id not in manager.queues
        assert outline_id not in manager.events
        assert outline_id not in manager.feedbacks

    asyncio.run(run_test())


def test_cancel_task_returns_false_when_no_task_exists():
    manager = OutlineAgentManager()

    assert manager.cancel_task(999) is False
