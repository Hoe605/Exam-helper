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
4. 数学公式必须使用 latex 格式 ，并且用 $...$(行内) 或 $$...$$(块级) 包裹
5. 你**必须**在开始回答时，先在 `<thinking>` 标签中对出题思路进行深度剖析。这包括：该难度下的核心考查逻辑、设计的干扰项原理、以及学生最容易掉进的陷阱。
6. 对于中高难度的题目，请尽量避免“下列说法正确/错误的是”这种单一模版，尝试场景化描述或复杂的逻辑关联题。


# 示例参考 (选择题)
<thinking>
我需要设计一道关于......
</thinking>
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
- **禁止** 在题目中出现给考试提示，例如：请注意...、提示：...
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
- **简单**: 考查基础概念、性质或直接应用。题干清晰明了，学生能够通过查阅基础文档直接得出答案，不设立复合逻辑。
- **中等**: 涉及知识点的基础综合，或包含一个常见的“陷阱”项。要求学生具备一定的推理能力，或能辨析容易混淆的概念边缘,需要多步思考和推理。
- **困难**: **严禁通过简单的记忆提取来解题**。必须涉及深度应用、多步逻辑推导、或者跨越本章节多个知识点的综合概括，多方法融合，复杂推理，高技巧性。建议出题思路包含：边界条件测试、反例辨析、或将抽象定理应用到复杂的具体场景中。
- **思考引导**: 请务必在 `<thinking>` 标签中先分析当前知识点的“深度挖掘点”和“易错盲区”，确保题目难度与要求匹配。
- **输出标签**: 请严格遵守 xml 标签规范（<question>, <option>, <tag>）。如果是填空或解答，请不要生成 <option>。

# 待处理文档内容如下:
{state['node_md']}

请开始生成题目：
"""
    response = await llm.ainvoke(prompt)
    
    return {
        "generated_content": response.content
    }
