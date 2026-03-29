import os

def load_prompt(prompt_path: str) -> str:
    """
    加载指定路径的提示词模板文件 (.md 或 .txt)
    路径基准为 src/core/prompt/
    
    支持子目录解析, 如: load_prompt("common/plan_task")
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_base_dir = os.path.abspath(os.path.join(current_dir, "..", "prompt"))
    
    # 构建完整的文件路径
    full_path = os.path.join(prompt_base_dir, prompt_path)
    
    # 自动处理常见后缀
    possible_paths = [
        full_path,
        full_path + ".md",
        full_path + ".txt"
    ]
    
    actual_path = None
    for p in possible_paths:
        if os.path.isfile(p):
            actual_path = p
            break
            
    if not actual_path:
        raise FileNotFoundError(f"未找到提示词模板文件: {prompt_path} (搜寻路径: {prompt_base_dir})")
        
    with open(actual_path, "r", encoding="utf-8") as f:
        return f.read()
