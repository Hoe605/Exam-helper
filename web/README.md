# Exam-helper Web

前端基于 Next.js 16（App Router）与 TypeScript。

## 包管理器

本目录统一使用 **pnpm**。

```bash
cd web
corepack enable
pnpm install --frozen-lockfile
```

## 开发

```bash
pnpm dev
```

默认地址：`http://localhost:3000`

## 环境变量

常用变量：

- `NEXT_PUBLIC_API_URL`：浏览器侧 API 地址（默认 `/api`）
- `BACKEND_URL`：服务端渲染/代理时访问后端地址（默认 `http://localhost:8000`）

## 校验

```bash
pnpm lint
pnpm build
```

## 代理与路径规范

- 前端通过 `app/api/[[...slug]]/route.ts` 代理后端请求。
- API 路径采用无尾斜杠规范。
