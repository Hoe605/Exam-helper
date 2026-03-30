import asyncio
import os
import sys
import time

# 确保项目根目录在 sys.path 中
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.core.agent.outline.outline_agent import build_outline_agent
from src.core.tools.db_tool import persist_outline_to_db

async def run_english_extraction():
    print("🚀 [ENGLISH] 开始解析英语考纲 (CET-4)...")
    
    file_path = os.path.abspath("files/英语考纲.md")
    if not os.path.exists(file_path):
        print(f"❌ 找不到文件: {file_path}")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print(f"📄 已加载英语考纲全文, 共 {len(content)} 字符。")
    print("⏳ 正在启动 DeepSeek 并发解析引擎 (Outline ID: 2)...")
    
    start_time = time.time()
    
    # 构造初始状态
    initial_state = {
        "document_content": content,
        "task_list": [],
        "task_status": {},
        "all_extracted_nodes": [],
        "errors": []
    }
    
    # 获取编译后的应用
    app = build_outline_agent()
    final_state = await app.ainvoke(initial_state)
    
    # 获取所有的扁平化节点
    final_nodes = final_state.get("all_extracted_nodes", [])
    errors = final_state.get("errors", [])

    print("-" * 60)
    if not final_nodes:
        print("❌ 解析失败，未提取到任何有效节点。")
    else:
        # 持久化到数据库，Outline ID 设为 2
        success = persist_outline_to_db(final_nodes, outline_id=2)
        if success:
            print(f"📌 持久化结果: ✅ 成功持久化 {len(final_nodes)} 个英语考纲节点 (ID: 2)。")
        else:
            print("📌 持久化结果: ❌ 数据库写入过程中出错。")

    end_time = time.time()
    print("=" * 60)
    print(f"✅ 全量任务执行完毕！耗时: {end_time - start_time:.2f} 秒")
    print(f"📊 统计信息:")
    print(f"   - 总提取节点数: {len(final_nodes)}")
    print(f"   - 异常/警告数: {len(errors)}")
    
    if errors:
        print("\n⚠️ 异常详情:")
        for err in errors:
            print(f"     - {err}")

    print("\n🎉 任务圆满完成。请检查数据库 ID 为 2 的相关记录！")

if __name__ == "__main__":
    asyncio.run(run_english_extraction())
