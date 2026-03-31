import os
from typing import List

def load_prompt(prompt_path: str) -> str:
    """
    加载完整的提示词模板文件内容
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_base_dir = os.path.abspath(os.path.join(current_dir, "..", "..", "prompt"))
    full_path = os.path.join(prompt_base_dir, prompt_path)
    
    # 自动处理常见后缀
    possible_paths = [full_path, full_path + ".md", full_path + ".txt"]
    actual_path = next((p for p in possible_paths if os.path.isfile(p)), None)
            
    if not actual_path:
        raise FileNotFoundError(f"未找到提示词模板文件: {prompt_path}")
        
    with open(actual_path, "r", encoding="utf-8") as f:
        return f.read()

def load_prompt_section(prompt_path: str, index: int = 0, separator: str = "---") -> str:
    """
    从一个提示词文件中提取特定段落。
    默认使用 '---' 作为分隔符。
    
    Args:
        prompt_path: 文件相对路径
        index: 段落索引 (从 0 开始)
        separator: 分隔符
    """
    full_content = load_prompt(prompt_path)
    # 按照分隔符拆分，并去除每一段首尾的空白
    sections = [s.strip() for s in full_content.split(separator)]
    
    if index >= len(sections):
        raise IndexError(f"文件 {prompt_path} 中只有 {len(sections)} 个段落，无法获取索引为 {index} 的内容。")
        
    return sections[index]

def load_all_sections(prompt_path: str, separator: str = "---") -> List[str]:
    """获取所有段落列表"""
    full_content = load_prompt(prompt_path)
    return [s.strip() for s in full_content.split(separator)]
