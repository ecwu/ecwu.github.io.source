---
title: 关于智能体的实验 0 - 学术文献阅读理解
subtitle:
author: Zhenghao Wu
description: 
featureimage:
unsplashfeatureimage:

publishDate: "2025-12-03T11:11:00+08:00"
lastmod: 
draft: false
status: In Progress
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: true
math: false
gallery: false
showinfocard: true
enablecomment: true

series: Reading Agent
previous:
next:

confidence: highly likely
importance: 7

tags:
- AI
- Agentic AI
- Multi-agent Systems
- Literature Review
- Academic Paper
- Research
- Reading
- 人工智能
- 智能体
- 多智能体系统
- 文献综述
- 学术论文
- 研究
- 阅读

categories:
- Tech
- AI
- Research

# type: file, link, image, and others
extramaterials:
- type: link
  name: SciRead Viewer
  url: https://ecwuuuuu.com/special-topic/sciread-viewer


copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

> 本文记录我在尝试构建智能体和多智能体系统的过程，探索其应用潜力。这会是一个系列文章，这一章节关注的是智能体的构建与多智能体动态交互行为的实现。最后会给出各类学术文章生成的报告示例。

## 前情

智能体发展迅速，但我对它的了解只停留在各种名词和概念的层面，于是想通过实际动手构建一些智能体系统来加深理解。

之前使用 [Cherry Studio](https://www.cherry-ai.com) 结合个人知识库 MCP 工具实现的一个文章理解的助手：文本从 PDF 中提取出来后，结合包含**理解文章**和**生成报告**任务的提示词发送给API，最终 LLM 调用 MCP 工具生成报告储存在知识库中。

{{< figure
  src="https://cdn.ecwuuuuu.com/blog/image/agent/cherry-studio-mcp-example.jpg-compressed.webp"
  type="full"
  label="cherry-studio-agentic-academic-literature-consuming"
  title="Cherry Studio 中构建的助手，使用 DeepSeek V3.2 模型理解 DeepSeek-OCR 文章"
  alt="alt"
>}}
{{< section "end" >}}

现在的模型 API，上下文窗口已经足够大，大多情况下可以直接将全文内容发送给模型进行理解。结果就是还不错的文章报告效果。我想以此为起点，我想试试设计不同的智能体和多智能体交互行为，实现读论文这个任务上多样的需求：

1. 体系化的文章理解
2. 模型自己决定阅读策略
3. 多智能体互相交流（提问和回应）寻求共识

## 智能体框架

为了挑选合适的工具，我去 Reddit 搜索了大家都在用什么工具，发现下面这些项目比较流行：

- [crewAI](https://docs.crewai.com/introduction) 多智能体框架，可以快速构建多 agent 协作、任务委派与工具调用流程。
- [AutoGen](https://www.microsoft.com/en-us/research/project/autogen/) 微软的项目，专注多智能体系统，通过对话协作（agent-agent、agent-人、工具集成）解决复杂任务流程
- [Agno](https://docs.agno.com/introduction) 专注多模态智能体的构建。
- [openai-agents-python](https://openai.github.io/openai-agents-python/) OpenAI 的项目，主打极简 API 构建 agent，支持同步和异步模式，工具调用和流程控制。
- [PydanticAI](https://ai.pydantic.dev/) Pydantic 团队的项目，专注于让 LLM 输出结构化、类型安全、验证可控，强化数据模型定义与验证能力。
- [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) LangChain 的项目，通过图结构（graph）方式编排工作流。

我最后选用了 PydanticAI，主要是看中他数据模型定义和验证的能力。 另外，PydanticAI 并没有封装太多智能体的行为逻辑，更多是提供一个工具库，方便我自己设计智能体和多智能体交互的流程。

## 系列展望

这个系列文章预计会有四个部分：

- 第 0 章：任务的定义，难点，构建智能体使用的工具（本文）
- 第 1 章：三种阅读理解学术文献的智能体框架
- 第 1.5 章：交互多智能体框架，走向
- 第 2 章：文本检索增强生成与高质量召回
- 第 3 章：通过工具调用使能更多能力
- 第 4 章：混合模型编排

敬请期待！
