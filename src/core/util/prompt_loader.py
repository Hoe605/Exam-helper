import os

def load_prompt(file_name: str) -> str:
    """
    加载指定名称的提示词模板文件 (.md 或 .txt)
    路径固定为 src/core/prompt/
    """
    # 获取当前项目的根路径
    # 逻辑: .../src/core/util/prompt_loader.py -> .../src/core/prompt/
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_dir = os.path.join(current_dir, "..", "prompt")
    
    # 拼接完整路径 (如果没后缀自动补全 .md)
    if not file_name.endswith((".md", ".txt")):
        file_name += ".md"
    
    file_path = os.path.join(prompt_dir, file_name)
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"未找到提示词模板文件: {file_path}")
        
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()
