from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, Float, DateTime, SmallInteger, func, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

# ==========================================
# 权限与用户表
# ==========================================

class User(SQLAlchemyBaseUserTable[int], Base):
    """用户表：继承 fastapi-users 基础模型"""
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True, nullable=True, comment="用户名")
    role = Column(String(50), default="student", comment="角色 (admin, teacher, student)")

    # 关联
    outlines = relationship("Outline", back_populates="teacher")


# ==========================================
# 知识图谱核心表
# ==========================================

class Outline(Base):
    """大纲表 (对应课程级别)"""
    __tablename__ = "outline"
    
    id = Column(Integer, primary_key=True, autoincrement=True, comment="主键")
    name = Column(String(255), nullable=False, comment="大纲名称 (如: 2026考研数学一)")
    desc = Column(Text, nullable=True, comment="大纲整体描述")
    content = Column(Text, nullable=True, comment="大纲原文文本")
    status = Column(String(50), default="Draft", comment="大纲状态 (Draft, Active, Archived)")
    metadata_ = Column("metadata", JSON, nullable=True, comment="元数据")
    is_deleted = Column(Boolean, default=False, index=True, comment="软删除标记")
    
    # 权限关联：标记该课程/大纲归属哪个老师
    teacher_id = Column(Integer, ForeignKey("user.id"), nullable=True, comment="归属教师 ID")
    
    # 关联
    teacher = relationship("User", back_populates="outlines")
    nodes = relationship("Node", back_populates="outline", cascade="all, delete-orphan")
    staging_questions = relationship("QuestionStaging", back_populates="outline_rel", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="outline_rel", cascade="all, delete-orphan")


class Node(Base):
    """知识节点表 (采用邻接表设计, 支持无限极树状结构)"""
    __tablename__ = "node"
    
    id = Column(Integer, primary_key=True, autoincrement=True, comment="主键")
    outline_id = Column(Integer, ForeignKey("outline.id"), nullable=False, comment="关联大纲表")
    f_node = Column(Integer, ForeignKey("node.id"), nullable=True, comment="父节点 ID")
    
    # 虽然设计文档中未明确列出 name，但图谱必须要有名称
    name = Column(String(255), nullable=False, comment="节点名称")
    desc = Column(Text, nullable=True, comment="知识点描述/详情")
    level = Column(Integer, nullable=False, comment="节点层级 (1: 学科/模块, 2: 章节, 3: 考点等)")
    status = Column(SmallInteger, default=1, comment="状态 (1: 启用, 0: 废弃/合并)")
    
    # 关联
    outline = relationship("Outline", back_populates="nodes")
    parent = relationship("Node", back_populates="children", remote_side=[id])
    children = relationship("Node", back_populates="parent", cascade="all, delete-orphan")
    mappings = relationship("QuestionNodeMapping", back_populates="node", cascade="all, delete-orphan")
    specifications = relationship("Specification", back_populates="node", cascade="all, delete-orphan")
    user_masteries = relationship("UserNodeMastery", back_populates="node", cascade="all, delete-orphan")


class QuestionStaging(Base):
    """
    题目提取缓冲区 (Staging Pool)
    """
    __tablename__ = "question_staging"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    q_type = Column(String(50), nullable=True)
    context = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)
    type = Column(String(64), nullable=True)
    
    status = Column(String(20), default="pending") # pending / approved / rejected / warning
    is_warning = Column(Boolean, default=False)
    warning_reason = Column(Text, nullable=True)
    duplicate_of_id = Column(Integer, nullable=True, comment="疑似重复的暂存区ID")
    duplicate_of_formal_id = Column(Integer, nullable=True, comment="疑似重复的正式库ID")
    outline_id = Column(Integer, ForeignKey("outline.id"), nullable=True, comment="物理外键ID")
    error_msg = Column(Text, nullable=True)
    difficulty = Column(Integer, comment="难度系数 (1-10)")
    created_at = Column(DateTime, default=func.now())
    
    # 关联
    outline_rel = relationship("Outline", back_populates="staging_questions")

class Question(Base):
    """题目主表 (存题干、题型及来源)"""
    __tablename__ = "question"
    
    id = Column(Integer, primary_key=True, autoincrement=True, comment="主键")
    context = Column(Text, nullable=False, comment="题目正文 (Markdown/Tex)")
    options = Column(JSON, nullable=True, comment="选项内容, 如: {\"A\": \"...\", \"B\": \"...\"}")
    q_type = Column(String(50), nullable=True, comment="题型 (单选/多选/填空/解答)")
    outline_id = Column(Integer, ForeignKey("outline.id"), nullable=True, comment="物理外键ID")
    type = Column(String(64), nullable=True, comment="题目来源类型 (真题 / 模拟题 / AI生成)")
    difficulty = Column(Integer, comment="难度系数 (1-10)")
    
    # 关联
    outline_rel = relationship("Outline", back_populates="questions")
    mappings = relationship("QuestionNodeMapping", back_populates="question", cascade="all, delete-orphan")
    answer = relationship("QuestionAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")
    user_logs = relationship("UserActionLog", back_populates="question", cascade="all, delete-orphan")

    @property
    def nodes(self):
        """便捷获取该题目关联的所有知识点对象"""
        return [m.node for m in self.mappings if m.node]


class QuestionNodeMapping(Base):
    """题目-知识点多对多关联表"""
    __tablename__ = "question_node_mapping"
    
    id = Column(Integer, primary_key=True, autoincrement=True, comment="主键")
    question_id = Column(Integer, ForeignKey("question.id"), nullable=False)
    node_id = Column(Integer, ForeignKey("node.id"), nullable=False)
    weight = Column(Float, nullable=True, comment="关联权重分")
    
    question = relationship("Question", back_populates="mappings")
    node = relationship("Node", back_populates="mappings")


class QuestionAnswer(Base):
    """答案与解析表"""
    __tablename__ = "question_answer"
    
    question_id = Column(Integer, ForeignKey("question.id"), primary_key=True, comment="关联题目表")
    answer_content = Column(Text, nullable=False, comment="标准答案")
    analysis = Column(Text, nullable=True, comment="详细解析")
    
    question = relationship("Question", back_populates="answer")


# ==========================================
# 业务生成表与用户轨迹表
# ==========================================

class Specification(Base):
    """生成规则表"""
    __tablename__ = "specification"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="主键")
    node_id = Column(Integer, ForeignKey("node.id"), nullable=False, comment="关联的核心知识点")
    prompt_rules = Column(Text, nullable=False, comment="AI出题归档规则")
    
    # 关联
    node = relationship("Node", back_populates="specifications")


class UserActionLog(Base):
    """用户做题流水表"""
    __tablename__ = "user_action_log"
    
    id = Column(Integer, primary_key=True, autoincrement=True, comment="主键")
    user_id = Column(Integer, nullable=False, index=True, comment="用户 ID")
    question_id = Column(Integer, ForeignKey("question.id"), nullable=False, comment="题目 ID")
    user_answer = Column(Text, nullable=True, comment="用户实际提交的答案")
    is_correct = Column(SmallInteger, nullable=False, comment="结果 (1: 全对, 2: 半对, 0: 全错)")
    time_spent = Column(Integer, nullable=True, comment="做题耗时（秒）")
    error_type = Column(JSON, nullable=True, comment="错误类型标签")
    ai_analysis = Column(Text, nullable=True, comment="AI 详细诊断说明")
    timestamp = Column(DateTime, default=datetime.utcnow, comment="做题时间")
    
    # 关联
    question = relationship("Question", back_populates="user_logs")


class UserNodeMastery(Base):
    """用户知识点掌握状态表"""
    __tablename__ = "user_node_mastery"
    
    id = Column(Integer, primary_key=True, autoincrement=True, comment="主键")
    user_id = Column(Integer, nullable=False, index=True, comment="用户 ID")
    node_id = Column(Integer, ForeignKey("node.id"), nullable=False, comment="知识点 ID")
    mastery_level = Column(Float, default=0.0, comment="掌握度得分 (0.0~1.0)")
    consecutive_correct = Column(Integer, default=0, comment="连续答对次数")
    total_attempts = Column(Integer, default=0, comment="历史总尝试次数")
    last_reviewed_at = Column(DateTime, nullable=True, comment="最后一次触达时间")
    next_review_at = Column(DateTime, nullable=True, comment="下次推荐复习时间")
    
    # 关联
    node = relationship("Node", back_populates="user_masteries")
