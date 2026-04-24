import uvicorn


def main():
    """
    兼容根目录启动方式，统一转发到真实服务入口。
    """
    uvicorn.run("src.services.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
