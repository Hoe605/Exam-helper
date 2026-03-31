import asyncio
import os
import sys

# 路径修复：确保能找到 src 目录
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.core.agent.question.extract.extract_agent import run_question_extraction_stream

async def demo_extract_agent():
    """
    演示题目提取 Agent (ExtractAgent) 的流式调用过程
    """
    sample_content = """
    # 统计学练习题
    
    1. 在单侧检验中，若 α=0.05，则拒绝域在该侧的概率为：
    A. 0.025
    B. 0.05
    C. 0.95
    D. 0.10
    
    2. 下列哪个指标反映了数据的离散程度？
    A. 均值
    B. 中位数
    C. 标准差
    D. 众数
    
    3. 请简述什么是 P 值。
    """
    
    print("🚀 [Demo] 启动题目提取任务...")
    print("=" * 60)
    
    # 模拟一个大纲 ID
    OUTLINE_ID = 101
    
    # 遍历流式输出的状态包
    async for status in run_question_extraction_stream(sample_content, outline_id=OUTLINE_ID):
        step = status["step"]
        count = status["count"]
        db_msg = status["db_response"]
        
        # 美化进度展示
        print(f"🔹 步骤: {step.upper()}")
        
        if step == "slicer":
            chunks = status["snapshot"].get("question_chunks", [])
            print(f"   📏 文档切分完成，共分为 {len(chunks)} 个片段。")
            
        elif step == "extractor":
            print(f"   🤖 AI 提取中... 当前已识别题目数: {count}")
            
        elif step == "saver":
            print(f"   💾 入库反馈: {db_msg}")
            if not status["errors"]:
                print(f"   ✅ 成功提取并暂存 {count} 道题目。")
            else:
                print(f"   ❌ 错误信息: {status['errors']}")
        
        print("-" * 30)

    print("=" * 60)
    print("🎉 题目提取 SDK 演示完毕。")

if __name__ == "__main__":
    # 运行演示
    asyncio.run(demo_extract_agent())
