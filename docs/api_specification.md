# API 设计规范：全站路径“去斜杠”化

为了彻底消除 Next.js 与 FastAPI 之间的重定向循环及地址泄露风险，本项目统一采用 **无尾部斜杠 (No Trailing Slash)** 的路径规范。

## 1. 核心规范
*   **Frontend**: `apiClient` 调用的所有 `path` 严禁以 `/` 结尾。
*   **Backend**: 所有的 FastAPI 路由定义 (`@router.get`, `@router.post` 等) 的字符串路径严禁以 `/` 结尾。
*   **BFF**: 代理层负责监控并修剪非法的尾部斜杠（作为兜底）。

## 2. 改造细则

### 后端 (Python/FastAPI)
*   根路径定义应为 `@router.get("")` 而不是 `@router.get("/")`。
*   子路径定义应为 `@router.get("/sub-path")`。
*   带 ID 路径：`@router.get("/{id}")`。

### 前端 (TypeScript)
*   Service 调用：`apiClient.get('/users')`。
*   路径模版：`` apiClient.get(`/users/${id}`) ``。

## 3. 拦截与保护
在 `web/lib/api-client.ts` 中加入自动修剪逻辑：
```typescript
const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
```

---

> [!IMPORTANT]
> 此规范即刻生效。所有历史代码将按此标准进行回退和重构。
