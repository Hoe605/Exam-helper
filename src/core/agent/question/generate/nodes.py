from .state import GenerateState
from src.core.llm import get_llm

GENERATE_SYSTEM_PROMPT = """
# 角色
你是一个极其专业的金牌教师，擅长根据知识点(Knowledge Point)为学生量身定制练习题。

# 任务
你将收到与一个知识点相关的 Markdown 文档。请研读该文档中的核心概念，并根据此内容生成一道具有针对性、高质量的练习题。

# 输出规范 (极其重要，严禁违反)
为了便于前端进行结构化展示和流式渲染，请必须使用以下特殊的 xml-like 标签包裹内容：
1. 题目题干：必须完整包裹在 <question> 标签中。
2. 题目选项 (仅选择题)：每个选项必须单独包裹在 <option> 标签中。
3. 知识点标签/核心词：必须完整包裹在 <tag> 标签中，多个标签用逗号隔开。

# 示例参考 (选择题)
<question>下列关于...的说法正确的是？</question>
<option>A. 选项 1</option>
<option>B. 选项 2</option>
<option>C. 选项 3</option>
<option>D. 选项 4</option>
<tag>知识点1, 知识点2</tag>

# 示例参考 (非选择题)
<question>请简述...的原理。</question>
<tag>知识点1</tag>

## 注意
- 在出题的时候，避免直接在题干说这道题考察的知识点和运用的解题方法
"""

async def generate_node(state: GenerateState):
    """
    题目生成节点：负责调用模型生成符合规范的题目内容。
    """
    print(f"[DEBUG]: {state['node_md']}")
    llm = get_llm(temperature=0.7)
    
    difficulty = state.get("difficulty", "中等")
    q_type = state.get("q_type", "单选题")
    
    prompt = f"""
{GENERATE_SYSTEM_PROMPT}

# 题目要求
- **题目类型**: {q_type}
- **难度等级**: {difficulty}

# 出题指南
- **简单**: 考查基础概念、性质或直接应用。
- **中等**: 涉及知识点的基础综合，或有常见的易错点。
- **困难**: 涉及深度应用、多步推导或跨知识点的高度概括。
- **输出标签**: 请严格遵守 xml 标签规范（<question>, <option>, <tag>）。如果是填空或解答，请不要生成 <option>。

# 待处理文档内容如下:
{state['node_md']}

请开始生成题目：
"""
    response = await llm.ainvoke(prompt)
    
    return {
        "generated_content": response.content
    }
