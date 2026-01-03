---
title: 关于智能体的实验 2 - 文本检索增强生成与高质量召回
subtitle:
author: Zhenghao Wu
description: 
featureimage:
unsplashfeatureimage:

publishDate: "2025-12-03T11:11:00+08:00"
lastmod: 
draft: true
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
- Research

# type: file, link, image, and others
extramaterials:



copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## 相关的模块

单体 Agent 相当的简单，但它也有一些局限性：全文都需要发送给模型，无法处理超过上下文长度的文本；输出的报告结构不可预测和控制；深度理解文章的能力有限。

我设想的智能体应该能够更体系化地理解文章内容，并且能够自主决定阅读策略（比如先读摘要和结论，再决定要不要读方法部分）。那么为了实现更复杂的智能体行为，我设计了一些模块来辅助智能体的构建。

1. 第一个模块是模型工厂（Model Factory），它可以根据特定格式的字符串创建不同的模型（提供商:模型名称，如 `deepseek:deepseek-chat`, `ollama:gemma3:latest`, `zhipu:glm-4.6`），而不需要在代码中硬编码特定的模型。这个模型方便我们选用多样的模型提供商（做细致的编排时，允许不同职责的智能体都选用不同的大模型但是不会让智能体实例化代码变得复杂）。
2. 第二个是文档对象（Document）。通过文件导入文本信息之后，文档对象提供一个接口用于获取文章内容，包括关键词搜索片段，章节、段落获取。这样，智能体就可以选择性地读取文章内容，而不是一次性地处理整个文档。

我将这个文档模块分成了三个部分：
{{< mermaid >}}
flowchart LR;
    A[Loader 载入器]
    B[Splitter 分割器]
    C[Document 文档对象]
A -->|text| B -->|chunks| C
{{</mermaid>}}

Loader 载入器类的工具负责从不同格式的文件中提取文本内容，比如 PDF、Word、Markdown 等（目前只实现了 PDF{{% sidenote "pdf-and-mineru-api" %}}为了实现准确的段落提取，我在 PDF Loader 中支持了 MinerU API 进行文档转 Markdown 的选项。{{% /sidenote %}} 和 TXT）。

Splitter 分割器类的工具负责将提取出来的文本内容进行分割，划分成章节、段落等结构化的形式。分割器可以根据不同的规则进行分割，比如（1）简单的按字符数量，（2）按句子分割，（3）按段落标记（如 Markdown 的 `#`），或者更复杂的（4）基于词嵌入相似度的分割。分割出来的每一个章节或段落，都会被封装成一个 Chunk 对象，里面包含文本内容和元数据。

Document 文档对象类的工具负责管理和组织分割出来的 Chunk 对象，提供一个统一的接口用于访问文章的不同部分。文档对象可以根据需要返回特定章节或段落的内容，或者提供全文搜索功能，方便智能体根据任务需求选择性地读取文章内容。

> 上面只简略的介绍了 Document 模块的设计思路，我们在 RAG 的章节会更详细地介绍这个模块。