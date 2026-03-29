import pytest

def pytest_addoption(parser):
    """添加自定义命令行参数 --deep"""
    parser.addoption(
        "--deep", action="store_true", default=False, help="运行深度的、消耗 Token 的集成测试"
    )

def pytest_configure(config):
    """注册自定义 marker"""
    config.addinivalue_line("markers", "deep: 标记为深度测试，仅在指定 --deep 时运行")

def pytest_collection_modifyitems(config, items):
    """
    如果测试项被标记为 deep，但没有传入 --deep 参数，则跳过这些测试。
    """
    if config.getoption("--deep"):
        # 如果有 --deep，说明我们要运行深度测试，不跳过
        return
    
    skip_deep = pytest.mark.skip(reason="需要 --deep 参数来运行深度集成测试")
    for item in items:
        if "deep" in item.keywords:
            item.add_marker(skip_deep)
