from typing import List, Optional
from pydantic import BaseModel, Field

class EduTaskStep(BaseModel):
    """具体的教育任务执行步骤"""
    step_id: int = Field(description="步骤序号, 从 1 开始")
    description: str = Field(description="该步骤的具体执行逻辑。例如：'提取一元函数微分学下的所有三级考点并建立父子关联'")
    start_anchor: Optional[str] = Field(description="该任务涉及的文本物理起点（起始句或核心标题）")
    end_anchor: Optional[str] = Field(description="该任务涉及的文本物理终点（结束句或下一章开始）")

class EduTaskPlan(BaseModel):
    """教育场景下的专属任务计划"""
    educational_objective: str = Field(description="本次任务的核心教育目标")
    knowledge_domain: str = Field(description="涉及的学科或知识域")
    global_background_content: Optional[str] = Field(description="考纲中的全局通用说明/前言部分的完整文本内容（非锚点），这些内容应作为所有子任务的共有背景")
    steps: List[EduTaskStep] = Field(description="为达成教育目标所设计的执行路径")
