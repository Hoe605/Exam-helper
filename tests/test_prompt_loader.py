import pytest
from core.utils.agent.prompt_loader import load_prompt, load_prompt_section, load_all_sections

def test_load_prompt_with_subdir():
    # 测试常规加载
    content = load_prompt("agent/outline_extraction")
    assert "教育大纲解析与计划指领" in content

def test_load_prompt_sections():
    """
    核心测试：验证 '---' 分割加载功能是否正常。
    """
    # 1. 验证段落 0 (计划阶段)
    section_0 = load_prompt_section("agent/outline_extraction", 0)
    assert "强制计划 (Compulsory Planning)" in section_0
    assert "教育大纲解析与计划" in section_0
    
    # 2. 验证段落 1 (解析提取阶段)
    section_1 = load_prompt_section("agent/outline_extraction", 1)
    assert "教育大纲知识提取助手" in section_1
    assert '"name"' in section_1 and '"description"' in section_1

def test_load_all_sections_count():
    """验证段落计数"""
    sections = load_all_sections("agent/outline_extraction")
    assert len(sections) == 2

def test_load_prompt_section_out_of_range():
    """验证越界保护"""
    with pytest.raises(IndexError):
        load_prompt_section("agent/outline_extraction", 999)
