import os
import sys
sys.path.append(os.getcwd())

from src.core.agent.question.question_agent import QuestionAgent

def run_standard_ingest():
    filepath = "files/试题.md"
    if not os.path.exists(filepath):
        print(f"❌ 找不到测试文件: {filepath}"); return

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    print(f"📖 [INGEST] 业务端开启题库解析: {os.path.basename(filepath)}...")
    print("-" * 50)

    # 1. 业务端调用入口：传入物理大纲 ID (1)
    agent = QuestionAgent()
    summary = agent.run(content, outline_id=1)
    
    # 2. 这里的 summary 已经非常清晰了
    print("\n" + "=" * 50)
    print(f"💎 [解析成功] 题目总数: {summary['count']} 道")
    print(f"归属大纲 ID: {summary.get('outline_id')}")
    print(f"数据库反馈: {summary['db_response']}")
    print("=" * 50)

if __name__ == "__main__":
    run_standard_ingest()
