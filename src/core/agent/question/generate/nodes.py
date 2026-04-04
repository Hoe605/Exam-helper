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
"""

async def generate_node(state: GenerateState):
    """
    题目生成节点：负责调用模型生成符合规范的题目内容。
    """
    llm = get_llm(temperature=0.7) # 这里的 Streaming=True 默认已在 get_llm 开启
    
    prompt = f"{GENERATE_SYSTEM_PROMPT}\n\n# 待处理文档内容如下:\n{state['node_md']}\n\n请开始生成题目："
    
    # 因为 LangGraph 内部可能只是普通调用 invoke
    # 但如果我们在 Service 里使用 astream_events，这里只需要能返回内容即可
    response = await llm.ainvoke(prompt)
    
    return {
        "generated_content": response.content
    }
