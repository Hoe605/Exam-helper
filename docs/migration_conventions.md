# Alembic Migration Conventions

## 文件命名规范

迁移文件名格式：`{revision_id}_{snake_case_description}.py`

**描述部分（snake_case）规则：**

- 使用英文，全小写，单词间用下划线连接。
- 描述应具体、清晰地表达变更内容，控制在 3–6 个单词。
- 禁止使用模板占位描述（例如 `描述你的修改`、`placeholder`）。
- 禁止在 `alembic revision` 时使用中文描述作为 `-m` 参数。

**示例：**

| ❌ 不允许                                      | ✅ 正确示例                                      |
|----------------------------------------------|------------------------------------------------|
| `20c8e8cc73fc_描述你的修改.py`               | `20c8e8cc73fc_add_outline_status_content.py`   |
| `abc_placeholder.py`                         | `abc_add_user_avatar_url_column.py`             |
| `xyz_增加is_deleted字段.py`                  | `xyz_add_soft_delete_to_outline.py`             |

## 生成迁移命令

```bash
cd <repo-root>
SECRET_KEY=xxx uv run alembic revision --autogenerate -m "add_<table>_<column_or_change>"
```

## 执行迁移命令

```bash
SECRET_KEY=xxx uv run alembic upgrade head
```

## 回滚命令

```bash
SECRET_KEY=xxx uv run alembic downgrade -1
```

## 手工 Patch 脚本与迁移脚本的边界

| 操作类型                         | 使用工具             |
|---------------------------------|---------------------|
| 表结构变更（加列/改类型/加索引）   | Alembic migration   |
| 数据初始化/清洗（仅运行一次）      | `scripts/` 目录脚本  |
| 业务数据批量修复                  | `scripts/` 目录脚本  |
| 权限种子数据                      | Alembic `data_migration` migration 或 `scripts/` |

**原则：** `scripts/` 中的脚本是一次性工具，不应包含 DDL 变更；DDL 变更必须通过 Alembic 管理。

## 迁移文件头模板

```python
"""<snake_case_description_same_as_filename>

Revision ID: <auto>
Revises: <auto>
Create Date: <auto>

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '<auto>'
down_revision: Union[str, Sequence[str], None] = '<auto>'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass  # TODO: fill in schema changes


def downgrade() -> None:
    pass  # TODO: fill in rollback
```
