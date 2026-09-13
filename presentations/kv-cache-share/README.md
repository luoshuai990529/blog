# 如何设计 KV Cache 友好的上下文

基于上一级目录同名文稿重新制作的 32 页 Slidev 中文分享稿。页面只呈现核心观点和重绘图示，展开讲解完整放在每页末尾的 HTML 注释中，由 Slidev 演讲者模式显示。

## 本地播放

使用 Node.js 24 和 pnpm：

```bash
pnpm install
pnpm exec slidev slides.md --port 4102
```

- 观众页面：http://localhost:4102/
- 演讲者模式：http://localhost:4102/presenter/

投影或线上共享只选择观众窗口。页面没有自动动画，使用方向键逐页讲解。演讲者 notes 不是保密内容，分享源文件或构建站点时也会包含 notes。

## 编排

1. 原理：注意力、KV Cache、Prompt Cache、Chat Template。
2. 前缀约束：变更传播、常见错误与架构取舍。
3. 提示词与能力：规则、Few-shot、工具定义、Skill。
4. 动态状态：状态提炼、内容、注入位置与更新策略。
5. 压缩与隔离：时机、五层措施、窗口记忆、子 Agent。
6. 研究展望、三条核心结论、延伸阅读。

`slides.md` 是可直接编辑的主文件。`styles/index.css` 定义投影版式。`scripts/source-coverage.json` 记录原稿行号到页面的映射。原稿图片仅用于 notes 参考，复制在 `public/source-notes/`；舞台图示采用可编辑 HTML/CSS，播放无需外部图片或在线字体。

每页 notes 包含“讲述提示”和相应“原稿讲解”。讲述提示对原稿中失效范围、模型协议、产品内部实现和研究数字作了边界说明；原文保留便于排练核对。研究数据未作为已验证性能结论展示。

## 检查和构建

```bash
pnpm test
pnpm check
pnpm build
```

结构检查确认每页有 notes、原稿非空行完整映射、旧版内容未混入舞台；测试额外核对原稿讲解没有丢失。构建输出到 `dist/`。视觉检查需另行打开页面完成。

`examples/` 中原有的 TTFT Python 与 Notebook 实验保留为独立资料，不属于新分享稿的页面内容。
