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

def list_endpoints(filter_query: str = None):
    """
    第一步：获取精简的接口列表
    只返回 Path, Method 和 Summary
    """
    openapi = get_full_openapi()
    paths = openapi.get("paths", {})
    summary_list = []
    
    for path, methods in paths.items():
        for method, info in methods.items():
            item = {
                "path": path,
                "method": method.upper(),
                "summary": info.get("summary", ""),
                "tags": info.get("tags", [])
            }
            if not filter_query or any(filter_query.lower() in str(val).lower() for val in item.values()):
                summary_list.append(item)
    
    return summary_list

def get_endpoint_details(target_path: str, target_method: str, filter_part: str = None):
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
    
    result = {
        "endpoint": f"{target_method.upper()} {target_path}",
        "summary": method_node.get("summary", ""),
        "description": method_node.get("description", "")
    }

    # 按需加载部分信息
    if not filter_part or filter_part == "parameters":
        result["parameters"] = method_node.get("parameters", [])
    
    if not filter_part or filter_part == "requestBody":
        result["requestBody"] = method_node.get("requestBody", {})
        
    if not filter_part or filter_part == "responses":
        result["responses"] = method_node.get("responses", {})

    # 提取引用到的原始组件定义
    components = openapi.get("components", {})
    result["schemas"] = components.get("schemas", {})
    
    return result

def main():
    parser = argparse.ArgumentParser(description="API 接口探测工具 - 供 Agent 使用")
    subparsers = parser.add_subparsers(dest="command", help="命令类型")
    
    # 第一步：列出/搜索接口
    list_parser = subparsers.add_parser("list", help="查看或通过关键字搜索接口")
    list_parser.add_argument("query", nargs="?", help="搜索关键字 (路径、Summary 或 Tag)")
    
    # 第二步：获取详情
    detail_parser = subparsers.add_parser("detail", help="获取指定接口的详细信息")
    detail_parser.add_argument("--path", required=True, help="接口路径 (e.g. /question/library/)")
    detail_parser.add_argument("--method", required=True, help="HTTP 方法 (e.g. GET)")
    detail_parser.add_argument("--part", choices=["parameters", "requestBody", "responses"], help="只显示指定部分的内容")
    
    args = parser.parse_args()
    
    if args.command == "list":
        result = list_endpoints(args.query)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    elif args.command == "detail":
        result = get_endpoint_details(args.path, args.method, args.part)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
