import asyncio
import os
import sys

# 路径修复
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.core.agent.outline.outline_agent import run_outline_extraction_stream

async def main():
    # 模拟一段极其简短的考纲原文
    with open("D:\\Code\\github\\Exam-helper\\files\\考纲.md", "r", encoding="utf-8") as f:
        sample_content = f.read()
    
    print("🌟 [Agent SDK] 启动流式解析任务...")
    print("-" * 50)
    
    # 直接调用流式生成器
    async for status in run_outline_extraction_stream(sample_content, outline_id=999):
        step = status["step"]
        node_count = status["node_count"]
        tasks = status["tasks"]
        
        # 美化输出进度
        print(f"📍 当前阶段: [{step.upper()}]")
        if step == "planning":
            print(f"   📋 计划已制定，共 {len(tasks)} 个任务。")
        elif step == "execution":
            completed = list(tasks.values()).count("completed")
            total = len(tasks)
            print(f"   ⚡ 解析中... 进度: {completed}/{total} | 提取节点: {node_count}")
        elif step == "persistence":
            if not status["errors"]:
                print(f"   💾 成功落库 {node_count} 个节点！")
            else:
                print(f"   ❌ 入库失败: {status['errors'][-1]}")
        
    print("-" * 50)
    print("✅ SDK 流程演示完毕。")

if __name__ == "__main__":
    asyncio.run(main())
