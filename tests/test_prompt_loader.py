import pytest
import os
from core.util.prompt_loader import load_prompt

def test_load_prompt_with_subdir():
    """
    测试加载器是否支持子目录 (agent/outline_extraction)
    """
    # 1. 测试 agent 目录下的
    content_agent = load_prompt("agent/outline_extraction")
    assert "教育大纲知识提取助手" in content_agent
    assert "{format_instructions}" in content_agent

def test_load_prompt_common_plan():
    """
    测试加载器是否支持 common 目录下的 plan_task
    """
    content_plan = load_prompt("common/plan_task")
    assert "Planning Mode" in content_plan
    assert "task" in content_plan.lower()

def test_load_prompt_extension_auto_complete():
    """
    测试是否能自动补充 .md 或直接识别全路径
    """
    content_1 = load_prompt("agent/outline_extraction")
    content_2 = load_prompt("agent/outline_extraction.md")
    assert content_1 == content_2

def test_load_prompt_not_found():
    """
    测试当文件不存在时是否抛出 FileNotFoundError
    """
    with pytest.raises(FileNotFoundError):
        load_prompt("non_existent_folder/nothing_here")
