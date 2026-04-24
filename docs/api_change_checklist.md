# API Change Checklist

每次新增或修改后端 API 时，请在合并前逐项确认：

- [ ] 路由路径不使用尾部斜杠（遵循 `docs/api_specification.md`）
- [ ] HTTP 状态码符合标准语义（4xx/5xx 不使用自定义非常规码）
- [ ] 请求体、响应体与字段命名保持一致，并能被前端消费
- [ ] 鉴权与权限校验逻辑已覆盖（尤其是 admin/teacher/student 边界）
- [ ] OpenAPI 文档可正常生成（`scripts/api_explorer.py` 可读取）
- [ ] 相关前端 service 层路径已同步更新
- [ ] 至少一个自动化测试覆盖关键路径（成功/失败场景）
- [ ] README 或相关 docs 已同步更新（若行为有变更）
