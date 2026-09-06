# KV Cache 分享稿发布

- 公开地址：https://libersum99.cc/kv-cache-share/
- 演讲者视图：https://libersum99.cc/kv-cache-share/#/presenter/1
- 博客入口：Notes → Agent 工程；首页不添加入口。
- 发布目录：`docs/kv-cache-share/`，沿用现有 GitHub Pages 工作流。
- 本次提交保存静态构建产物，演讲备注公开。原始 Slidev 项目继续在 agent_share/agent-kv-cache-slidev 维护。

## 更新

在 Slidev 项目中（Node.js 24、pnpm）运行：

```sh
pnpm install --frozen-lockfile
pnpm exec slidev build slides.md --base /kv-cache-share/ --router-mode hash --out dist-kv-cache-share
```

用这次构建的完整目录替换博客 `docs/kv-cache-share/`。不要将新旧带哈希文件名的产物累积混用。
保留默认演讲备注，不使用 `--without-notes`。
构建会自动处理图片子路径；实验回放按 BASE_URL 读取 `cache-demo/results.json`。
Notebook 和采集脚本用于下载到本地运行，网站仅回放记录，不调用模型 API。

提交前运行 `sh docs/tests/verify-site.sh`，用普通静态服务器检查首页、Notes 入口、
分享稿图片、逐步展示、刷新、实验回放、下载和演讲者备注。
推送 main 后确认 Pages 工作流成功，再打开线上链接检查。
