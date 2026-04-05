---
trigger: always_on
---

这是一个后端基于langgraph + fastAPI 前端使用next.js 的项目
注意:
后端使用uv作为管理工具 前端使用pnpm作为管理工具
前端的组件库使用shadcn，当你需要引入组件的时候，自行创建，尽量不要使用其他组件库，如果有这个组件库无法满足的，先获取同意后再安装其他的组件
如果能使用shadcn解决的，避免使用原生组件写重复的代码
每一个删除和确认按钮，都应当加入确认弹窗以及操作后的message
API 路径规范：全站“去斜杠”化 (Strict No Trailing Slash)
全站 API 路径必须遵循无尾部斜杠原则。

后端 (FastAPI):
路由定义严禁以 / 结尾。
正确的写法：@router.get("") 或 @router.get("/stats")。
错误的写法：@router.get("/") 或 @router.get("/stats/")。
前端 (Next.js Services):
Service 层调用路径严禁包含尾部斜杠。
示例：apiClient.get('/outlines')。

3. BFF 代理架构
前端通过 web/app/api/[[...slug]]/route.ts 建立了一个透明代理层，作为所有请求的中转站。

3.1 安全特性：物理地址隐藏
重定向改写: 代理层会拦截后端返回的 307/308 响应。如果 Location 头包含后端的物理 IP 或端口 (如 8000)，代理会自动将其重写为前端域名 (/api/...)。
内部跳转 (Internal Redirect Following): 为了兼容性和极致性能，代理会自动在服务器内部完成路径纠偏（如 /users -> /users/ 的纠正），直接将结果返回。这不仅隐藏了跳转过程，也消除了浏览器层面的重定向循环。