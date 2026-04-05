from .state import ClassifyState
from src.core.utils.node import get_nodes_by_level
from src.db.session import SessionLocal
from src.db.models import Question, QuestionNodeMapping, Node
from src.core.llm import get_llm
import json
import logging

logger = logging.getLogger(__name__)

CLASSIFY_PROMPT = """
# 角色
你是一个极其专业的教研员，擅长将零散的练习题精准地分类到所属的课程章节中。

# 任务
目前我有一个待分类的题目以及一组候选章节(Level 2 知识点)。
请根据题干内容，判定这道题最应该属于哪一个章节。

# 候选章节列表:
{candidate_list_text}

# 待分类题干预览:
{question_content}

# 输出规范 (极其重要)
1. 请仅从候选列表中选择一个最贴切的章节。
2. 必须以 JSON 格式输出，包含 "node_id" 和 "node_name" 两个字段。
3. 如果确实无法判定，或者所有候选章节都不符合，请返回 {{"node_id": null, "node_name": "None"}}。

# 输出 JSON:
"""

async def fetch_context_node(state: ClassifyState):
    """
    节点 1：补充题目上下文并获取大纲下的 Level 2 章节
    """
    q_id = state["q_id"]
    with SessionLocal() as db:
        question = db.query(Question).filter(Question.id == q_id).first()
        if not question:
            return {"errors": ["Question not found in formal database."]}
        
        outline_id = question.outline_id
        if not outline_id:
             return {"errors": ["Question has no outline_id."]}
             
        # 获取所有 Level 2 节点 (章节级)
        level2_nodes_orm = get_nodes_by_level(outline_id, 2)
        candidate_nodes = [
            {"id": n.id, "name": n.name, "desc": n.desc} 
            for n in level2_nodes_orm
        ]
        
        return {
            "question_content": question.context,
            "outline_id": outline_id,
            "candidate_nodes": candidate_nodes
        }

async def llm_classify_node(state: ClassifyState):
    """
    节点 2：调用 LLM 进行分类判定
    """
    if not state["candidate_nodes"]:
        return {"errors": ["No candidate nodes available for classification."]}
        
    candidate_list_text = "\n".join([
        f"- ID: {n['id']} | 名称: {n['name']} | 描述: {n['desc'] or '(无描述)'}" 
        for n in state["candidate_nodes"]
    ])
    
    llm = get_llm(temperature=0) # 分类需要确定性
    prompt = CLASSIFY_PROMPT.format(
        candidate_list_text=candidate_list_text,
        question_content=state["question_content"]
    )
    
    response = await llm.ainvoke(prompt)
    
    try:
        # LLM 输出清洗与解析
        clean_content = response.content.strip()
        if "```json" in clean_content:
            clean_content = clean_content.split("```json")[-1].split("```")[0].strip()
        
        data = json.loads(clean_content)
        return {
            "selected_node_id": data.get("node_id"),
            "selected_node_name": data.get("node_name")
        }
    except Exception as e:
        logger.error(f"Classification parse error: {e}")
        return {"errors": [f"LLM Output parse error: {str(e)}"]}

async def save_mapping_node(state: ClassifyState):
    """
    节点 3：持久化关联结果
    """
    node_id = state.get("selected_node_id")
    q_id = state["q_id"]
    
    if not node_id:
        return {"db_status": "Skipped (No node selected)"}
        
    with SessionLocal() as db:
        try:
            # 检查是否已存在关联
            existing = db.query(QuestionNodeMapping).filter(
                QuestionNodeMapping.question_id == q_id,
                QuestionNodeMapping.node_id == node_id
            ).first()
            
            if not existing:
                new_mapping = QuestionNodeMapping(
                    question_id=q_id,
                    node_id=node_id,
                    weight=1.0 # 初始权重
                )
                db.add(new_mapping)
                db.commit()
                return {"db_status": "Success (New mapping created)"}
            else:
                return {"db_status": "Success (Mapping already exists)"}
        except Exception as e:
            db.rollback()
            return {"errors": [f"DB Write error: {str(e)}"]}
