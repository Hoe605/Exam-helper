import sys
import os
import json
import argparse

# 将项目根目录添加到 python 路径，以便导入 src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from src.services.main import app
    from fastapi.openapi.utils import get_openapi
except ImportError as e:
    print(f"导入失败: {e}")
    sys.exit(1)

def get_full_openapi():
    """生成完整的 OpenAPI JSON"""
    return get_openapi(
        title=app.title,
        version=app.version,
        openapi_version=app.openapi_version,
        description=app.description,
        routes=app.routes,
    )

def list_endpoints():
    """
    第一步：获取精简的接口列表
    只返回 Path, Method 和 Summary
    """
    openapi = get_full_openapi()
    paths = openapi.get("paths", {})
    summary_list = []
    
    for path, methods in paths.items():
        for method, info in methods.items():
            summary_list.append({
                "path": path,
                "method": method.upper(),
                "summary": info.get("summary", ""),
                "tags": info.get("tags", [])
            })
    
    return summary_list

def get_endpoint_details(target_path: str, target_method: str):
    """
    第二步：获取对应接口的具体信息（包含参数、请求体、响应结构）
    """
    target_method = target_method.lower()
    openapi = get_full_openapi()
    
    path_node = openapi.get("paths", {}).get(target_path)
    if not path_node:
        return {"error": f"未找到路径: {target_path}"}
    
    method_node = path_node.get(target_method)
    if not method_node:
        return {"error": f"在路径 {target_path} 中未找到方法: {target_method.upper()}"}
    
    # 提取引用到的原始组件定义 (可选，为了让 Agent 看到完整的数据模型)
    components = openapi.get("components", {})
    
    return {
        "endpoint": f"{target_method.upper()} {target_path}",
        "info": method_node,
        "schemas": components.get("schemas", {})  # 返回所有 schema 以便 Agent 能够解析 $ref
    }

def main():
    parser = argparse.ArgumentParser(description="API 接口探测工具 - 供 Agent 使用")
    subparsers = parser.add_subparsers(dest="command", help="命令类型")
    
    # 第一步：列出所有接口
    subparsers.add_parser("list", help="获取精简的接口列表")
    
    # 第二步：获取详情
    detail_parser = subparsers.add_parser("detail", help="获取指定接口的详细信息")
    detail_parser.add_argument("--path", required=True, help="接口路径 (e.g. /question/library/)")
    detail_parser.add_argument("--method", required=True, help="HTTP 方法 (e.g. GET)")
    
    args = parser.parse_args()
    
    if args.command == "list":
        result = list_endpoints()
        print(json.dumps(result, ensure_ascii=False, indent=2))
    elif args.command == "detail":
        result = get_endpoint_details(args.path, args.method)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
