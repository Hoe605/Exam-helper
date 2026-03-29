from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool

class EduTaskStep(BaseModel):
    """具体的教育任务执行步骤"""
    step_id: int = Field(description="步骤序号, 从 1 开始")
    action_type: str = Field(description="行动类型，例如：'大纲解析', '知识点打标', '题目生成', '学情分析'")
    description: str = Field(description="该步骤的具体执行逻辑。例如：'提取一元函数微分学下的所有三级考点并建立父子关联'")
    expected_output: Optional[str] = Field(description="步骤的预期产出物，例如：'JSON格式的知识结构树', '3道带解析的微积分选择题'")

class EduTaskPlan(BaseModel):
    """教育场景下的专属任务计划"""
    educational_objective: str = Field(description="本次任务的核心教育目标，例如：'完善考研数学一知识图谱' 或 '针对学生薄弱点生成补救练习'")
    knowledge_domain: str = Field(description="涉及的学科或知识域，例如：'高等数学', '英语语法'")
    steps: List[EduTaskStep] = Field(description="为达成教育目标所设计的执行路径")
    risk_assessment: str = Field(description="潜在教研难点或风险预判，例如：'原大纲连字符不统一，需要仔细正则匹配层级'")

@tool("edu_task_planner", args_schema=EduTaskPlan)
def edu_task_planner_tool(educational_objective: str, knowledge_domain: str, steps: List[EduTaskStep], risk_assessment: str) -> str:
    """
    教育任务调度与规划工具。在执行如大纲解析、题目生成、学情诊断等复杂教育任务前，必须调用本工具制定详细的教研执行计划。
    
    Args:
        educational_objective: 核心教育目标
        knowledge_domain: 知识域/学科
        steps: 拆解后的具体教研步骤
        risk_assessment: 风险与难点预判
    """
    print(f"\n[EDU PLAN RECEIVED] 学科: {knowledge_domain} | 目标: {educational_objective}")
    for s in steps:
        print(f"  - 步骤 {s.step_id} [{s.action_type}]: {s.description} (预期产出: {s.expected_output})")
    
    print(f"  ⚠️ 难点预判: {risk_assessment}")
        
    return f"教研计划已收到：包含 {len(steps)} 个专门步骤。请按照计划继续执行底层核心逻辑。"
