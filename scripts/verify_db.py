import os
import sys
sys.path.append(os.getcwd())

from src.db.session import SessionLocal
from src.db.models import QuestionStaging

db = SessionLocal()
try:
    print("\n🔍 --- 检查 Warning 题目溯源 ---")
    warnings = db.query(QuestionStaging).filter(QuestionStaging.is_warning == True).all()
    
    for row in warnings:
        print(f"ID: {row.id} | 状态: {row.status}")
        print(f"💡 警告原因: {row.warning_reason}")
        print(f"📄 题目正文: {row.context[:60]}...")
        print("-" * 30)
        
    print(f"\n📊 统计: 共发现 {len(warnings)} 条可疑项目。")
except Exception as e:
    print(f"❌ 查询失败: {str(e)}")
finally:
    db.close()
