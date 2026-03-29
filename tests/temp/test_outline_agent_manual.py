import os
import sys

# 把 src 加入路径，防止执行失败
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

from core.agent.outline.outline_agent import build_outline_agent
import logging

logging.basicConfig(level=logging.INFO)

def run_test():
    sample_text = """
    2026考研数学一考试大纲
    第一部分：高等数学
    一、函数、极限、连续
    1. 函数的概念及表示法
    2. 数列极限与函数极限的定义
    二、一元函数微分学
    1. 导数和微分的概念
    2. 导数的几何意义和物理意义
    """
    
    print("=== 初始化 Agent ===")
    agent = build_outline_agent()
    
    print("=== 执行 Agent ===")
    try:
        result = agent.invoke({"document_content": sample_text})
        
        print("\n\n[最终解析结果]:")
        for node in result.get("extracted_nodes", []):
            print(f"[{node.level}级] {node.name} (父级: {node.parent_name}) - {node.desc}")
            
    except Exception as e:
        print(f"测试由于异常失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
