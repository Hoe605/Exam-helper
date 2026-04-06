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
你是一个极其专业的教研员，擅长将零散的练习题精准地分类到所属的课程章节中，并对题目难度进行权威评估。

# 任务
目前我有一个待分类的题目以及一组候选章节(Level 2 知识点)。
1. **判定章节**: 请根据题干内容，判定这道题最应该属于哪一个候选章节。
2. **评估难度**: 给出该题目的难度分值（1-10分），并给出简要的评分理由。

# 难度评分参考标准:
| 难度区间 | 定义 | AI 评估标准 (参考指标) |
| :--- | :--- | :--- |
| 1-3 (基础) | 了解与识记 | 单一知识点，直接套用公式或定义。干扰项极少。 |
| 4-6 (进阶) | 理解与应用 | 需要 2-3 个知识点串联，或者存在一定的逻辑转弯（如：逆向思维）。 |
| 7-8 (困难) | 分析与综合 | 综合性极强，涉及跨章节知识点，干扰项极强，需要多步推导。 |
| 9-10 (挑战) | 评价与创新 | 极高认知负荷。包含隐藏条件、陷阱，或需要非常规的解题策略。 |

# 候选章节列表:
{candidate_list_text}

# 待分类题干预览:
{question_content}

# 输出规范 (极其重要)
1. 请仅从候选列表中选择一个最贴切的章节。
2. 必须以 JSON 格式输出，包含以下字段:
   - "reason": 为什么你认为这道题难度是该分值，及其应属章节的分析过程？（详细分析）
   - "difficulty": 1-10 的整数。
   - "node_id": 所选章节的 ID。如果无法判定，请返回 null。
   - "node_name": 所选章节的名称。如果无法判定，请返回 "None"。
3. 严禁返回任何非 JSON 文本。

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
            "selected_node_name": data.get("node_name"),
            "difficulty": data.get("difficulty"),
            "difficulty_reason": data.get("reason")
        }
    except Exception as e:
        logger.error(f"Classification parse error: {e}")
        return {"errors": [f"LLM Output parse error: {str(e)}"]}

async def save_mapping_node(state: ClassifyState):
    """
    节点 3：持久化关联结果
    """
    difficulty = state.get("difficulty")
    node_id = state.get("selected_node_id")
    q_id = state["q_id"]
    
    with SessionLocal() as db:
        try:
            # 1. 更新题目难度 (如果有)
            if difficulty is not None:
                db.query(Question).filter(Question.id == q_id).update({"difficulty": difficulty})
            
            # 2. 检查是否已存在关联
            if not node_id:
                db.commit()
                return {"db_status": "Difficulty updated (No node selected)"}

            existing = db.query(QuestionNodeMapping).filter(
                QuestionNodeMapping.question_id == q_id,
                QuestionNodeMapping.node_id == node_id
            ).first()
            
            if not existing:
                new_mapping = QuestionNodeMapping(
                    question_id=q_id,
                    node_id=node_id,
                    weight=1.0
                )
                db.add(new_mapping)
                db.commit()
                return {"db_status": f"Success (Difficulty updated & Mapping created)"}
            else:
                db.commit()
                return {"db_status": "Success (Difficulty updated & Mapping already exists)"}
        except Exception as e:
            db.rollback()
            return {"errors": [f"DB Write error: {str(e)}"]}
