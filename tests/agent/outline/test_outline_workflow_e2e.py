import os
import sys
import json

# 加入项目根目录到 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from src.core.agent.outline.outline_agent import build_outline_agent
from langgraph.graph import START

def run_e2e_outline_agent():
    print("🚀 [E2E TEST] 开始全链路考纲解析入库测试...")
    
    # 1. 加载一小段用于测试的真实大纲内容
    # 这里我们构造一段极简版的数学内容，确保它能触发 Planning 切片和 Execution 提取
    sample_content = """
    # 2026年全国硕士研究生招生考试数学考试大纲
    
    ## 考试科目：高等数学
    
    ### 第一章 函数、极限、连续
    【考试内容】
    函数的概念及表示法；函数的有界性、单调性、周期性和奇偶性；复合函数、反函数、分段函数和隐函数。
    基本初等函数的性质及其图形；初等函数；函数关系的建立。
    数列极限与函数极限的定义及其性质；函数的左极限和右极限。
    
    ### 第二章 一元函数微分学
    【考试内容】
    导数和微分的概念；导数的几何意义和物理意义；函数的可导性与连续性之间的关系。
    平面曲线的切线和法线；导数和微分的四则运算；基本初等函数的导数。
    """
    
    # 2. 构建图谱应用
    app = build_outline_agent()
    
    # 3. 初始化状态
    initial_state = {
        "document_content": sample_content,
        "edu_objective": "",
        "knowledge_domain": "",
        "global_context_anchor": None,
        "task_list": [],
        "task_status": {},
        "all_extracted_nodes": [],
        "errors": []
    }
    
    print("\n⏳ 正在提交应用祈求 (Invoke)... 这可能需要 1-3 分钟，视模型响应速度而定。")
    print("-" * 50)
    
    # 4. 执行状态机
    # langgraph 会自动在节点间流转，并返回最终合并后的 state
    final_state = app.invoke(initial_state)
    
    print("-" * 50)
    print("✅ [E2E TEST] 工作流执行完毕！")
    
    # 5. 打印最终成果概览
    errors = final_state.get("errors", [])
    if errors:
        print(f"\n⚠️ 警告/错误记录:")
        for err in errors:
            print(f"  - {err}")
            
    extracted_nodes = final_state.get("all_extracted_nodes", [])
    print(f"\n🏆 最终提取节点数: {len(extracted_nodes)}")
    
    if extracted_nodes:
        print("\n🧐 抽样前 5 个落网节点 (平铺态):")
        for i, node in enumerate(extracted_nodes[:5]):
            print(f"  {i+1}. [{node.level}级] {node.name} (父: {node.parent_name})")
            
    print("\n🎉 如果以上节点数大于 0 且无数据库报错，去看看你的 SQLite 数据表吧！")

if __name__ == "__main__":
    run_e2e_outline_agent()
