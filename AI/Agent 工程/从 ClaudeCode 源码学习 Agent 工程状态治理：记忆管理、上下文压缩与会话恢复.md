---
title: 从 ClaudeCode 源码学习 Agent 工程状态治理：记忆管理、上下文压缩与会话恢复
tags:
  - AI
  - Agent
  - Agent工程
  - 状态治理
  - 记忆管理
  - 上下文压缩
  - 会话恢复
aliases:
  - Agent 状态治理
  - Agent 记忆管理
  - Agent 上下文压缩
  - Agent 会话恢复
---

# 从 ClaudeCode 源码学习 Agent 工程状态治理：记忆管理、上下文压缩与会话恢复

## 一、背景：为什么从 ClaudeCode 源码看 Agent 状态治理

这篇文章是基于本地 `ClaudeCode` 源码阅读后整理出来的 Agent 工程最佳实践

ClaudeCode 这类 AI Coding Agent 和普通聊天机器人最大的区别在于：它不是只回答问题，而是在真实工程环境里持续执行任务。

一次复杂任务中，Agent 会不断产生和消费这些信息：

- 用户需求和补充约束。
- 项目规则、CLAUDE.md、技能（Skills）、钩子（Hooks）。
- 文件读取结果。
- 命令行（Shell）输出。
- 搜索结果。
- 工具调用参数和返回值。
- 子 Agent 的探索结论。
- 待办事项（Todo）、计划（Plan）、验证状态。
- 文件修改历史。
- 当前工作目录和工作树状态（worktree）。

这些信息增长速度远高于普通聊天。如果全部塞进上下文，模型很快会遇到三个问题：

1. **上下文放不下。**
2. **关键信息被噪音稀释。**
3. **进程退出后无法恢复工作现场。**

所以长期 Agent 必须具备三类状态治理能力：

```text
记忆管理
  → 把稳定信息和阶段性任务状态沉淀到上下文窗口之外

上下文压缩
  → 在上下文接近上限前，把历史压缩成可继续执行的最小上下文

会话恢复
  → 在重启、会话恢复（resume）、任务中断后，恢复可继续执行的工作现场
```

> [!summary] 核心判断
> Agent 工程状态治理的目标，不是让模型“记住更多内容”，而是把长期信息、当前任务状态、工具结果和会话现场从上下文窗口中拆出来，用可持久化、可压缩、可恢复的工程机制管理起来。

## 二、Agent 工程记忆管理最佳实践

### 1. 问题背景

Agent 的记忆不能只依赖当前上下文。

上下文窗口适合承载“当前这一轮推理需要的信息”，不适合长期保存用户偏好、项目约定、历史反馈和任务阶段性总结。

如果把所有记忆都放进常驻 Prompt，会出现几个问题：

- 常驻上下文越来越长。
- 提示词缓存命中率下降（Prompt Cache）。
- 旧信息和新信息混在一起，难以更新。
- 错误记忆难以删除。
- 每次调用都为不一定用到的信息付费。

ClaudeCode 源码里把记忆拆成了两类：长期记忆和会话记忆。

### 2. ClaudeCode 源码体现

长期记忆主要在：

```text
src/memdir/
```

关键入口是：

```text
src/memdir/memdir.ts
src/memdir/paths.ts
```

其中 `loadMemoryPrompt()` 负责把记忆规则（memory）注入系统提示词，`isAutoMemoryEnabled()` 负责判断是否启用自动记忆。

这套长期记忆的核心设计是：

```text
记忆目录（memory/）
  → MEMORY.md 作为索引
  → 每条记忆单独写入一个 Markdown 文件（memory file）
  → 通过元数据头（frontmatter）描述名称、说明、类型等信息
```

`MEMORY.md` 不是用来堆所有记忆内容的，而是一个轻量索引。真正的记忆内容分散在独立文件里。

会话记忆主要在：

```text
src/services/SessionMemory/
```

关键文件包括：

```text
src/services/SessionMemory/sessionMemory.ts
src/services/SessionMemory/sessionMemoryUtils.ts
src/services/SessionMemory/prompts.ts
```

会话记忆模块（SessionMemory）会在主会话输出后，通过采样后钩子（post-sampling hook）触发后台抽取逻辑。它不是让主 Agent 自己手动总结，而是启动一个隔离的分叉 Agent（forked agent），把当前会话中的关键进展写入会话记忆文件（session memory）。

### 3. 抽象出来的最佳实践

Agent 记忆应该至少分成两层：

| 记忆类型 | 保存内容 | 更新方式 | 作用 |
|---|---|---|---|
| 长期记忆 | 用户偏好、项目约定、长期反馈、稳定知识 | 按主题写入独立文件 | 跨会话复用 |
| 会话记忆 | 当前任务进展、关键决策、未完成事项、验证状态 | 后台定期抽取 | 支撑长任务压缩和恢复 |

长期记忆适合保存稳定信息，例如：

- 用户偏好的沟通方式。
- 项目约定。
- 常用命令。
- 工程边界。
- 历史反馈。

会话记忆适合保存当前任务状态，例如：

- 当前任务目标。
- 已完成步骤。
- 关键决策。
- 已验证和未验证的内容。
- 风险点。
- 下一步计划。

不要把这两类混在一起。

长期记忆如果塞入会话摘要，会污染后续任务；会话记忆如果写入长期记忆文件（memory），会让长期记忆变成任务日志。

### 4. 为什么这样设计

这个设计解决的是“记忆可维护性”问题。

如果只写一个大的记忆文件（memory file），短期看简单，长期会不可控：

- 内容会越来越长。
- 模型不知道哪些记忆更重要。
- 删除过期信息困难。
- 重复记忆越来越多。
- 每次加载都会带来 token 成本。

用“索引 + 独立文件”的结构，可以让记忆具备几个工程特性：

- 可按主题组织。
- 可局部更新。
- 可删除过期记忆。
- 可做检索和按需加载。
- 可审计记忆来源。

用后台分叉 Agent（forked agent）更新会话记忆文件（session memory），则解决了另一个问题：

> 主 Agent 应该专注完成任务，记忆整理应作为后台状态维护任务执行。

这样可以避免主 Agent 在执行任务时频繁被“总结自己”打断，也能避免记忆更新污染主会话上下文。

### 5. 记忆管理落地建议

MVP 阶段可以先做最小版本：

```text
记忆目录（memory/）
  MEMORY.md
  user_preferences.md
  project_rules.md
```

然后逐步增加：

1. 给每条记忆增加元数据头（frontmatter）。
2. 区分用户记忆、项目记忆、反馈记忆、参考记忆。
3. 增加去重和更新规则。
4. 增加会话记忆文件（session memory）。
5. 在长任务中由后台任务定期抽取会话记忆（session memory）。
6. 在压缩时优先使用会话记忆（session memory），而不是临时总结全部历史。

记忆管理的底线是：

> 可从源码、数据库、文档实时获取的信息，不要轻易写入长期记忆；记忆只保存“需要跨上下文复用，但不容易从当前环境推导出来的信息”。

## 三、Agent 工程上下文压缩最佳实践

### 1. 问题背景

Agent 上下文压缩不是把聊天记录缩短一点。

对 AI Coding Agent 来说，上下文里最大的问题往往不是用户聊天，而是工具结果：

- 大文件读取结果。
- grep / glob 返回。
- shell 日志。
- 测试输出。
- WebFetch 内容。
- 子 Agent 回传内容。
- 多轮工具调用记录。

这些内容在当时有用，但后续不一定需要完整保留。

如果不压缩，系统会遇到：

- token 成本持续上升。
- 上下文窗口溢出。
- 模型注意力被旧工具结果占用。
- 当前任务目标被稀释。
- 提示词缓存被动态内容频繁破坏（Prompt Cache）。

### 2. ClaudeCode 源码体现

上下文压缩的主要入口在：

```text
src/query.ts
src/services/compact/
```

关键文件包括：

```text
src/services/compact/microCompact.ts
src/services/compact/autoCompact.ts
src/services/compact/compact.ts
src/services/compact/sessionMemoryCompact.ts
```

ClaudeCode 在每次模型调用前，会先处理当前消息列表（messages），大致顺序是：

```text
消息列表（messages）
  → 取压缩边界（compact boundary）之后的消息
  → 工具结果预算控制
  → 历史裁剪（snip / history trimming）
  → 轻量压缩（microcompact）
  → 上下文折叠后的投影视图（context collapse）
  → 自动压缩（autoCompact）
  → 调用模型
```

它不是只做一种压缩，而是分层压缩。

### 3. 多层压缩策略

#### 3.1 工具结果预算控制

第一层是限制单条消息中的工具结果体积。

工具返回内容过大时，不能无限进入上下文。旧的、超预算的工具结果应该被替换、截断或落盘。

这层解决的是：

> 单个工具结果过大，直接污染上下文窗口。

#### 3.2 轻量压缩（microcompact）：清理工具结果

`microcompactMessages()` 主要处理旧工具结果。

它关注的不是“总结对话”，而是把旧的工具输出瘦身。例如清理旧的文件读取结果、shell 输出、搜索结果等。

可以把它理解为：

> 轻量压缩（microcompact）是工具结果清理层，不是语义摘要层。

这层适合高频运行，因为它的目标是减少噪音，而不是重新理解整段任务历史。

#### 3.3 自动压缩（autoCompact）：接近阈值前自动压缩

`autoCompactIfNeeded()` 会基于当前 token 数判断是否接近上下文上限。

它不会等到上下文爆掉才压缩，而是提前预留 buffer。

原因是压缩本身也需要模型调用，也需要输出空间。如果等到完全超限，压缩请求本身可能也发不出去。

这层解决的是：

> 在上下文接近风险区之前，主动把旧历史压缩掉。

#### 3.4 会话记忆压缩（session memory compact）：优先使用持续维护的摘要

`trySessionMemoryCompaction()` 会尝试使用已经维护好的会话记忆文件（session memory）进行压缩。

它会判断：

- 会话记忆文件（session memory）是否存在。
- 会话记忆文件（session memory）是否为空模板。
- 哪些消息已经被总结过。
- 最近一段消息是否需要保留。
- 是否会切断 tool_use / tool_result 配对。
- 压缩后是否仍然超过阈值。

这比临时摘要更稳定，因为会话记忆文件（session memory）是持续维护的，不是上下文爆掉时临时抢救。

#### 3.5 传统压缩摘要（traditional compact summary）：摘要兜底

如果会话记忆压缩（session memory compact）不可用，就走 `compactConversation()`。

它会调用模型生成 conversation summary，然后用 summary 替换旧历史。

但 ClaudeCode 的传统压缩并不是只留下 summary。它还会重新注入继续执行所需的信息，例如：

- 近期文件附件。
- 当前 plan。
- plan mode 状态。
- invoked skills。
- deferred tools。
- agent listing。
- MCP 指令（MCP instructions）。
- session start hooks 结果。

这说明压缩后的上下文不是“短”，而是要“可继续执行”。

### 4. 抽象出来的最佳实践

Agent 上下文压缩应该分层做：

```text
第一层：工具结果清理
  → 控制文件读取、shell、搜索等大结果

第二层：轻量压缩
  → 清理旧工具输出，减少噪音和 token

第三层：会话级压缩
  → 用会话记忆（session memory）或摘要替代旧历史

第四层：压缩后重建
  → 重新注入继续执行所需的文件、计划、工具、技能（skills）、MCP、钩子（hooks）
```

压缩时需要保留的信息包括：

- 当前任务目标。
- 用户明确约束。
- 已完成步骤。
- 当前计划。
- 关键决策。
- 文件修改状态。
- 验证结果。
- 未完成事项。
- 风险和回滚信息。
- 最近仍然相关的原始消息。

不能只追求摘要短。

### 5. 为什么这样设计

普通聊天压缩的目标是“让对话还能读懂”。

Agent 压缩的目标是“让任务还能继续执行”。

所以压缩后必须满足：

1. 模型知道当前任务是什么。
2. 模型知道之前做过什么。
3. 模型知道哪些约束不能破坏。
4. 模型知道当前文件和计划状态。
5. 模型仍然能调用正确工具。
6. 模型不会因为 tool_use / tool_result 不完整导致 API 报错。

这就是为什么 ClaudeCode 压缩后要重新注入计划（plan）、技能（skills）、工具（tools）、MCP 和钩子（hooks）。

### 6. 上下文压缩落地建议

不要一开始就做复杂压缩系统。

推荐顺序是：

1. **先控制工具返回大小**

   所有工具都要有最大输出限制。大结果落盘，返回摘要和文件路径。

2. **增加工具结果清理**

   对旧的 shell 输出、搜索结果、文件内容做替换或裁剪。

3. **增加手动压缩（manual compact）**

   先让用户或上层调度决定什么时候压缩。

4. **增加自动压缩（auto compact）阈值**

   在上下文接近上限前自动触发，并预留压缩输出空间。

5. **增加会话记忆压缩（session memory compact）**

   长任务中优先用持续维护的会话记忆文件（session memory）进行压缩。

6. **增加压缩后上下文重建**

   把 plan、文件状态、工具说明、权限、skills、hooks 重新注入。

压缩的底线是：

> 不要切断工具调用配对，不要丢失当前任务目标，不要丢失验证状态，不要让压缩后的上下文无法继续执行。

## 四、Agent 工程会话恢复最佳实践

### 1. 问题背景

长期 Agent 必须支持中断后继续。

中断可能来自：

- 用户主动退出。
- 终端关闭。
- 网络中断。
- 进程崩溃。
- 模型流式输出被打断。
- 工具调用执行到一半。
- 子 Agent 任务未完成。
- 用户通过恢复命令（`/resume` 或 `--continue`）恢复旧任务。

如果系统只保存聊天文本，恢复后只能“看起来像继续聊天”，但无法真正继续执行工程任务。

会话恢复的目标应该是：

> 恢复可继续执行的工作现场，而不是恢复可阅读的聊天记录。

### 2. ClaudeCode 源码体现

会话恢复主要在：

```text
src/utils/conversationRecovery.ts
src/utils/sessionRestore.ts
src/utils/sessionStorage.ts
src/main.tsx
```

核心入口包括：

```text
loadConversationForResume()
processResumedConversation()
loadTranscriptFromFile()
buildConversationChain()
deserializeMessagesWithInterruptDetection()
```

ClaudeCode 使用 JSONL 会话日志（transcript）记录会话，每条消息有消息唯一标识（`uuid`）、父消息标识（`parentUuid`）、会话标识（`sessionId`）、时间戳（`timestamp`）等信息。

恢复时不是简单按文件顺序读取，而是：

```text
读取会话日志（transcript）
  → 找到叶子消息（leaf message）
  → 沿父消息标识（parentUuid）反向构建会话链（conversation chain）
  → 修复并行工具调用（tool_use）和工具结果（tool_result）分支
  → 清理不合法消息
  → 恢复 session 状态
  → 启动 REPL
```

### 3. 为什么需要父消息标识（parentUuid）

Agent 会话不是简单线性日志。

真实运行中可能出现：

- 一个 assistant turn 中有多个并行 tool_use。
- 每个 tool_use 对应不同 tool_result。
- streaming 输出会产生多个 assistant message。
- 子 Agent 和支线会话（sidechain）会产生分支。
- 压缩（compact）、历史裁剪（snip）、会话恢复（resume）都会改变可见历史。

如果只按写入顺序恢复，可能会把不属于当前链路的消息也恢复进来，或者丢掉并行工具结果。

父消息标识（`parentUuid`）的作用是记录消息之间的因果关系。

通过叶子消息（leaf message）向前追溯，可以恢复“当前这条会话路径”。

### 4. 恢复时需要修复半截状态

恢复时，ClaudeCode 会做一轮消息修复。

典型处理包括：

- 过滤未完成的 tool_use。
- 过滤孤立的 thinking message。
- 过滤只有空白文本的 assistant message。
- 迁移旧 attachment 类型。
- 清理无效 permission mode。
- 检测是否是中断的 turn。
- 必要时插入 `Continue from where you left off.` 这类 meta message。
- 如果最后一条是 user message，补 synthetic assistant sentinel，保证 API 消息格式合法。

这类处理很关键。

如果恢复时把半截 tool_use 带回模型，下一次 API 调用可能直接报错；如果把未完成 thinking 块原样恢复，也可能破坏模型消息格式。

### 5. 恢复的不只是消息列表（messages）

`processResumedConversation()` 做的事情说明，会话恢复不能只恢复消息列表。

它还会恢复：

- session id。
- 会话日志（transcript）文件指针。
- cost 状态。
- agent setting。
- agent name / color。
- coordinator / normal mode。
- 工作树（worktree）目录。
- attribution state。
- file history。
- todo 状态。
- 上下文折叠提交日志（context collapse commit log）。
- 内容替换（content replacement）记录。
- skill state。

这些状态决定了 Agent 能不能继续工作。

例如：

- 如果不恢复工作树（worktree），Agent 可能在错误目录执行命令。
- 如果不恢复 file history，无法正确回滚或解释文件变化。
- 如果不恢复 todo，任务进度会丢。
- 如果不恢复内容替换（content replacement），旧工具结果可能重新膨胀，破坏缓存和上下文。
- 如果不恢复 agent setting，原来用的专门 Agent 可能变成默认 Agent。

### 6. 抽象出来的最佳实践

Agent 会话恢复至少要持久化四类数据：

| 类型 | 作用 |
|---|---|
| 消息链路 | 恢复对话和工具调用历史 |
| 任务状态 | 恢复 todo、plan、验证状态 |
| 工程状态 | 恢复当前工作目录（cwd）、工作树状态（worktree）、文件历史、权限 |
| 压缩状态 | 恢复压缩边界（compact boundary）、内容替换（content replacement）、上下文折叠（context collapse） |

日志格式建议使用追加写入式 JSONL（append-only JSONL）。

每条消息至少要有：

- 消息唯一标识（`uuid`）。
- 父消息标识（`parentUuid`）。
- 会话标识（`sessionId`）。
- 时间戳（`timestamp`）。
- 消息类型（`type`）。
- 消息内容（`content`）。
- 是否为支线会话（sidechain）。

恢复时不要相信日志天然合法，必须做校验和修复。

### 7. 会话恢复落地建议

MVP 阶段可以先做：

```text
session.jsonl
  → 记录 user / assistant / tool_use / tool_result
  → 支持按会话标识（sessionId）加载
  → 恢复消息列表（messages）
```

进入长任务后，再逐步增加：

1. 消息唯一标识（`uuid`）和父消息标识（`parentUuid`）。
2. 通过叶子消息（leaf message）重建会话链（conversation chain）。
3. tool_use / tool_result 完整性校验。
4. 中断 turn 修复。
5. todo / plan 恢复。
6. 当前工作目录（cwd）和工作树（worktree）恢复。
7. file history 恢复。
8. 压缩边界（compact boundary）和内容替换（content replacement）恢复。
9. 支线会话（sidechain）和子 Agent（subagent）区分。
10. fork session 能力。

会话恢复的底线是：

> 恢复后的第一轮模型调用必须是 API 合法的，并且 Agent 必须处在正确的工作目录、正确的任务状态和正确的权限上下文中。

## 五、三者如何形成完整状态治理闭环

记忆管理、上下文压缩、会话恢复不是三套孤立功能。

它们共同构成 Agent 长任务运行的状态治理闭环：

```text
用户输入任务
  → Agent 执行工具
  → 工具结果和模型输出写入会话日志（transcript）
  → 后台会话记忆（SessionMemory）抽取关键进展
  → 上下文接近阈值时触发压缩
  → 压缩后重新注入可执行上下文
  → 会话退出时保留会话日志（transcript）和工程状态
  → 恢复会话（resume）时恢复消息链路和工作现场
  → Agent 继续执行任务
```

可以把 ClaudeCode 的解法抽象成下面这张表：

| 工程问题 | ClaudeCode 解法 | 可复用实践 |
|---|---|---|
| 长期信息不能每轮塞进提示词（Prompt） | `memdir` 记忆目录 | 长期记忆用索引 + 独立文件管理 |
| 当前任务进展容易在压缩中丢失 | 会话记忆（`SessionMemory`）后台抽取 | 会话记忆应周期性维护 |
| 工具结果太大 | 工具结果预算控制（tool result budget）/ 轻量压缩（microcompact） | 工具输出要有预算和清理机制 |
| 上下文接近上限 | `autoCompactIfNeeded` | 提前触发压缩，不等爆窗 |
| 临时摘要容易丢信息 | 会话记忆压缩（session memory compact） | 优先使用持续维护的摘要压缩历史 |
| 压缩后模型忘记执行环境 | 压缩后附件注入（post-compact attachments） | 压缩后重建计划（plan）、工具（tools）、技能（skills）、MCP |
| 进程退出后无法继续 | JSONL 格式的会话日志（transcript JSONL） | 会话日志必须可恢复 |
| 并行工具结果恢复错误 | 父消息标识（`parentUuid`）+ 链路恢复（chain recovery） | 用因果链恢复消息，不只按时间顺序 |
| 恢复后消息不合法 | deserialize repair | 恢复时修复半截 tool_use 和 thinking |
| 恢复后状态不一致 | `sessionRestore` | 恢复消息列表（messages）之外的工程状态 |

这套闭环的关键不是某一个模块，而是边界划分：

- 记忆解决“什么应该跨上下文保留”。
- 压缩解决“什么应该从活跃上下文移出”。
- 恢复解决“如何重新进入可执行现场”。

## 六、工程落地思考

如果要自己实现一个长期运行的 Agent，不建议一开始就照 ClaudeCode 做完整系统。我认为更合理的落地路径是分阶段演进。

### 1. MVP 阶段：先做会话日志（transcript）和简单恢复（resume）

最小可用系统先保证：

- 每轮用户、助手、工具调用（user / assistant / tool）都能写入 JSONL。
- 每条消息有会话标识（sessionId）和时间戳（timestamp）。
- 可以通过会话标识（sessionId）加载历史消息列表（messages）。
- 恢复后能继续调用模型。

这一步解决“任务不能断点续跑”的基础问题。

### 2. 长任务阶段：加入任务状态外化

当 Agent 开始执行多步骤任务时，需要把状态写到上下文之外：

- todo。
- plan。
- 当前步骤。
- 已验证结果。
- 待处理风险。

不要依赖模型在上下文里自然记住。

### 3. 工具结果膨胀阶段：加入轻量压缩（microcompact）

当工具输出开始变大时，先治理工具结果，而不是马上做复杂摘要。

建议：

- 工具返回结果设置最大长度。
- 大结果落盘。
- 返回摘要 + 文件路径。
- 旧工具结果替换成占位符。
- 保留最近几次关键工具结果。

### 4. 上下文接近上限阶段：加入自动压缩（auto compact）

自动压缩必须提前触发。

设计时至少考虑：

- 模型上下文窗口。
- 压缩摘要需要的输出空间。
- 压缩失败兜底。
- 连续失败熔断。
- 压缩后 token 是否仍然过高。

### 5. 多轮长任务阶段：加入会话记忆文件（session memory）

当任务可能持续几十轮甚至跨天时，需要后台维护会话记忆文件（session memory）。

建议：

- 不要每轮都总结。
- 根据 token 增量和工具调用次数触发。
- 用隔离后台 Agent 更新。
- 限制后台 Agent 只能读写记忆文件（memory）。
- 压缩时优先使用会话记忆（session memory）。

### 6. 多 Agent 阶段：加入父消息标识（parentUuid）和支线会话（sidechain）

如果系统支持子 Agent 或并行工具调用，线性日志会不够用。

这时应该引入：

- 消息唯一标识（`uuid`）。
- 父消息标识（`parentUuid`）。
- 支线会话（sidechain）标识。
- 叶子消息（leaf message）。
- 会话链（conversation chain）重建。

否则恢复会话（resume）时很容易恢复错上下文。

### 7. 工程化阶段：恢复完整工作现场

最后再补齐：

- 当前工作目录（cwd）和工作树（worktree）。
- file history。
- Agent 类型（agent type）。
- permissions。
- skills state。
- 压缩边界（compact boundary）。
- 内容替换（content replacement）。
- cost state。
- session metadata。

不要只恢复消息。

## 七、工程落地中的坑

### 1. 把记忆（memory）写成任务日志

长期记忆文件（memory）只应该保存稳定信息。

如果把每次任务过程都写进去，记忆文件（memory）会快速膨胀，后续任务也会被历史噪音污染。

### 2. 压缩只追求摘要短

摘要很短不代表可继续执行。

Agent 压缩必须保留决策、约束、验证状态和下一步计划，否则压缩后模型只能重新猜。

### 3. 工具结果没有预算

很多 Agent 系统上下文爆掉不是因为聊天太长，而是工具输出太长。

工具层必须有输出预算，不能把大日志、大文件、大搜索结果原样返回。

### 4. 恢复时只读消息列表（messages）

只恢复消息会导致工作现场不完整。

Agent 可能恢复到错误目录、错误 agent、错误权限、错误 todo 状态。

### 5. 忽略半截 tool_use

中断发生在工具调用中间时，日志里可能有未完成的 tool_use 或孤立 thinking。

恢复时必须修复，否则下一次模型调用可能直接失败。

### 6. 没有压缩失败熔断

压缩也可能失败。

如果失败后每轮继续重试，会浪费大量 API 调用，并且用户无法继续任务。

需要设置连续失败上限和兜底策略。

## 八、最终沉淀

ClaudeCode 源码给出的启发是：成熟 Agent 的关键不只是“模型会不会调用工具”，而是系统能不能把任务状态管理起来。

上下文窗口只是运行时工作区，不应该承担所有记忆、日志和状态职责。

长期信息应该进入长期记忆文件（memory），阶段性进展应该进入会话记忆文件（session memory），大型工具结果应该被预算和压缩，完整会话现场应该进入会话日志（transcript），恢复时再把必要状态重新装配回来。

一句话总结：

> Agent 状态治理的核心不是让模型记住更多，而是把长期信息、当前任务状态、工具结果和会话现场从上下文窗口中拆出来，用可持久化、可压缩、可恢复的工程机制管理起来。
