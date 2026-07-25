# 《MCP 最佳落地实践》重构设计

## 目标

将现有文章重构为一篇精炼、可长期维护的 MCP Server 技术沉淀文档：先解释 MCP 的定位与边界，再以官方 Python SDK 展示从 Tool Contract、Server 开发到测试、Streamable HTTP 部署和生产治理的完整路径。

## 读者与范围

目标读者是了解 Python、HTTP 与 Agent 基础，希望建设企业 MCP Server 的开发者。文章聚焦 MCP Server，不展开 Agent 编排框架、模型原理或具体厂商业务。

示例使用官方稳定版 Python SDK v1 API。依赖必须固定生产版本范围并设置 `<2` 上界；采用 v2 前重新核对官方稳定状态和迁移指南。

## 结构

1. MCP 背景、角色与适用边界。
2. 企业级 MCP Server 分层架构。
3. 使用官方 Python SDK 从 0 到 1 实现订单服务。
4. Tool Contract、ToolSpec、Toolset 与 Inventory 策略过滤。
5. 结构化结果、分页、Resource、错误语义。
6. 单元、协议契约、Inspector、Agent E2E 与 Contract Diff。
7. OAuth Resource Server、无状态 Streamable HTTP、容器部署和可观测性。
8. 最小权限、写操作治理、Prompt Injection 防护和版本演进。
9. 一页式生产检查清单与官方参考资料。

## 示例架构

示例工程保持最小但具备企业边界：

```text
app/
├── server.py          # FastMCP、lifespan、transport
├── context.py         # AppContext 与请求级依赖
├── models.py          # Pydantic 输入输出契约
├── registry.py        # ToolSpec、Toolset、策略过滤
├── policies.py        # scope、只读、feature flag
├── tools/orders.py    # MCP 适配层
└── services/orders.py # 业务服务与权限判断
tests/
├── test_orders.py
└── test_contracts.py
```

`get_order_detail` 展示只读查询、身份隔离和最小输出；`cancel_order` 展示权限校验、幂等键、状态前置条件与写操作审计。身份必须来自认证上下文，不能来自模型参数。

## 通用设计原则

从成熟 MCP Server 中提炼语言无关的工程模式，不引用具体 GitHub 业务：

- Tool 自描述：名称、描述、输入输出、只读属性、Toolset、scope 和 feature flag 集中定义。
- Inventory 治理：区分“系统具有哪些能力”和“当前请求可以发现哪些能力”。
- 请求级依赖：Handler 依赖抽象服务，认证身份和下游客户端由上下文注入。
- 最小暴露：按场景、租户和权限裁剪候选工具，避免上下文膨胀。
- 结果整形：不透传上游大 JSON；使用结构化输出、分页、摘要与 ResourceLink。
- 执行层安全：Tool 注解只辅助 Host，真正授权、幂等和数据边界由 Server 强制执行。
- Contract as API：对 tools/list、Schema 和典型 tools/call 结果做快照与变更 Diff。

## 错误、测试与部署

预期业务错误使用稳定错误码或 ToolError；内部异常记录 trace ID，对模型隐藏堆栈和敏感数据。测试采用业务单元测试、官方内存 Client/Server 会话、Schema 快照、Inspector 和固定 Agent 任务集。

本地使用 stdio；生产使用 `stateless_http=True`、`json_response=True` 的 Streamable HTTP。远程服务作为 OAuth 2.1 Resource Server 校验 issuer、audience、expiry 和 scope，并配置 HTTPS、请求大小、超时、限流、审计、指标与灰度发布。

## 编辑约束

- 保留现有 Frontmatter、Obsidian 链接和中文写作风格。
- 删除重复论述、练习题和与主线无关的扩展。
- 代码示例接口前后一致，不使用伪造的 SDK API。
- 正文不耦合 `github-mcp-server`；其经验只以通用模式出现。
- 官方事实链接到 MCP 官方文档或官方 SDK 仓库。

## 验收标准

- 读者能从文章中还原一个可运行、可测试、可部署的 Python MCP Server。
- 核心代码覆盖类型契约、依赖生命周期、授权、Inventory、错误、测试和生产 transport。
- 文档比现稿更紧凑，没有同义反复和只列原则不落代码的关键章节。
- 文档明确区分 Tool 提示、Host 审批和 Server 强制授权。
- 所有 Markdown 代码围栏、内部链接和外部链接格式正确。
