---
title: 学术文献的阅读与理解 - 关于智能体的实验 - 第 1 章
subtitle:
author: Zhenghao Wu
description: 
featureimage:
unsplashfeatureimage:

publishDate: "2025-11-05T11:11:00+08:00"
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

之前使用 [Cherry Studio](https://www.cherry-ai.com) 结合个人知识库 MCP 工具实现的一个文章理解的智能体：文本从 PDF 中提取出来后，结合包含**理解文章**和**生成报告**任务的提示词发送给API，最终 LLM 调用 MCP 工具生成报告储存在知识库中。

{{< figure
  src="https://cdn.ecwuuuuu.com/blog/image/agent/cherry-studio-mcp-example.jpg-compressed.webp"
  type="full"
  label="cherry-studio-agentic-academic-literature-consuming"
  title="Cherry Studio 中构建的智能体，使用 DeepSeek V3.2 模型理解 DeepSeek-OCR 文章"
  alt="alt"
>}}
{{< section "end" >}}

现在的模型 API，上下文窗口已经足够大，可以直接将文章内容发送给模型进行处理，这个智能体的效果还挺不错的。但更进一步，我想试试设计不同的智能体和多智能体交互行为，实现读论文这个任务上多样的需求：

1. 体系化的文章理解
2. 模型自己决定阅读策略
3. 多智能体互相交流（提问和回应）寻求共识

## 工具

为了挑选合适的工具，我去 Reddit 看看都在用什么，发现下面这些项目比较流行：

- [crewAI](https://docs.crewai.com/introduction) 多智能体框架，可以快速构建多 agent 协作、任务委派与工具调用流程。
- [AutoGen](https://www.microsoft.com/en-us/research/project/autogen/) 微软的项目，专注多智能体系统，通过对话协作（agent-agent、agent-人、工具集成）解决复杂任务流程
- [Agno](https://docs.agno.com/introduction) 专注多模态智能体的构建。
- [openai-agents-python](https://openai.github.io/openai-agents-python/) OpenAI 的项目，主打极简 API 构建 agent，支持同步和异步模式，工具调用和流程控制。
- [PydanticAI](https://ai.pydantic.dev/) Pydantic 团队的项目，专注于让 LLM 输出结构化、类型安全、验证可控，强化数据模型定义与验证能力。
- [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) LangChain 的项目，通过图结构（graph）方式编排工作流。

我选用了 PydanticAI，主要是看中他数据模型定义和验证的能力。 另外，PydanticAI 并没有封装太多智能体的行为逻辑，更多是提供一个工具库，方便我自己设计智能体和多智能体交互的流程。

## 单体 Agent (single-agent)

使用 PydanticAI 实现 Agent 很简单。创建对象时定义好使用的模型，系统提示词和任务指令，调用 `run` 方法传入文章内容就可以了：

```python
from pydantic_ai import Agent

simple_agent = Agent(  
    'deepseek:deepseek-chat',
    system_prompt=(
        'You are an expert academic document analyst with deep knowledge across multiple scientific disciplines. Your task is to carefully analyze academic papers and provide comprehensive, accurate, and insightful reports.'
    ),
    instructions=(
        """Your task is to write a detailed report using the Feynman technique to explain a given paper. When creating this report, you should approach it as if you were the author of the paper.
        Here are some important constraints:

        - Title and basic info first: Start the report with the paper title, authors, and publication details.
        - Content Format: When writing the content of the report, use multiple levels of titles and subtitles to organize the information clearly, using markdown formats such as bold & italic text, code block, table, and lists. This will make the report easier to read and understand.
        - Serious Work Requirement: This report is a serious piece of work, so avoid using emojis when writing the report.
        - Content Don'ts: Do not start the content with the paper title, it already displayed in the page title; Do not mention/introduce the faynman technique in the content.
"""
)

simple_agent.run(
    '<insert paper text here>'
)
```

这个单体 Agent 基本复刻了我之前在 Cherry Studio 中实现的效果（只是不需要包括 MCP 工具调用指引）。生成报告的质量主要取决选用的模型和提示词设计。这里使用的提示词我是参考 Reddit 上的[一个回答](https://www.reddit.com/r/notebooklm/comments/1i5028w/comment/m84k66j/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button)。使用费曼技巧（Feynman Technique）来理解文章内容，并且以作者的视角来写报告。

{{<mermaid>}}
flowchart LR;
    A[文章]
    B[Agent]
    C[报告]

    A --> B --> C

    style A fill:#E3F2FD,stroke:#2196F3,stroke-width:2px,color:#0D47A1
    style B fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100
    style C fill:#E8F5E9,stroke:#43A047,stroke-width:2px,color:#1B5E20
{{</mermaid>}}

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

## ReAct Agent

ReAct（Reasoning and Acting）是 2022 年 Google Research 提出的一个范式，发表于论文 ReAct: Synergizing Reasoning and Acting in Language Models [^1]。文中将显式推理（Reasoning）与行动执行（Acting）结合起来，使模型能够在「思考 → 行动 → 观察」的循环中逐步完成复杂任务。
在 ReAct 中，模型不会直接给出最终答案，而是通过多轮推理和与外部环境交互（如调用工具、执行操作）逐步逼近解决方案{{% sidenote "react-tool-sidenote" %}}一般的 ReAct Agent 的 Acting 部分是调用外部工具（比如搜索引擎、代码执行等）；在这个文章阅读任务中，行动为获取文章内容。{{% /sidenote %}}。

我设计的 ReAct Agent 流程和提示词设计上允许它自主决定阅读策略：

1. 【思考】初始状态下，Agent 会获得文章的前三个 Chunk （相当于文章标题、摘要、引言）的内容和所有能访问段落的列表。根据这些内容生成初步的理解和阅读计划。
2. 【行动】Agent 会根据阅读计划选择文章的部分段落阅读，并理解和分析。
3. 【思考】总结刚刚阅读的内容，Agent 需要产生以下几个内容（多个字段是一次请求输出的，利用了 Pydantic BaseModel 结构化）
   - **刚看过片段的总结**：这将是生成报告的一部分，我们会将这些总结累积起来。
   - **下一个阅读计划**：基于当前的理解，决定接下来要阅读哪些 Chunk。
   - **是否完成阅读**：判断是否已经完成了对文章的理解，决定是否继续阅读。
   - **思考过程**：为什么要做出上面的决定。
4. 【行动】根据阅读计划，Agent 会选择下一个 Chunk 进行阅读。
5. 重复步骤 3 和 4，直到 Agent 判断完成阅读，即 `是否结束` 字段为`是`。
6. 最后，Agent 会将所有阅读过的片段总结进行收尾相连，生成最终的报告。{{%sidenote "react-agent-figure-explain" %}}
需要注意的是，下图中的`智能体规划`和`执行文段阅读`并不是两次独立的调用。ReAct 的过程是外部循环控制的。也就是说，智能体在每次思考后，都会决定下一步的行动（阅读哪个片段），然后外部系统会获取这个行动所需的内容并反馈给智能体，智能体再进行下一轮思考，形成一个循环，直到智能体决定任务完成。
{{% /sidenote %}}

### 流程示意图

{{< mermaid >}}
flowchart TB;
    A[文章基础信息]
    subgraph ReAct 循环
        B[智能体规划]
        C[执行文段阅读]
        F{是否结束}
        B -->|计划| F
        C -->|思维过程| B
        F -->|否| C
    end
    
    E[报告片段集合]
    G[最终报告]

A --> B

C -->|报告片段| E
F -->|是| G
E --> G

    style A fill:#E3F2FD,stroke:#2196F3,stroke-width:2px,color:#0D47A1
    style B fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100
    style C fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100
    style G fill:#E8F5E9,stroke:#43A047,stroke-width:2px,color:#1B5E20
{{</mermaid>}}

ReAct Agent 范式的直接好处是，它允许智能体在阅读过程中动态调整阅读策略，在一个高效的文章内容召回工具的支持下，能实现在优化阅读效率的同时，提升文章理解的深度和广度。同时，ReAct 的思考-行动循环也显式地展现了智能体的推理过程，使得整个阅读和理解过程更加透明。

但从目前的实验来看，ReAct Agent 生成报告的最大问题是，报告没有一个清晰的结构，内容连贯性较差。因为我们是让智能体每次阅读一个片段后生成阅读到内容的总结，最后再将这些总结拼接在一起，结构上往往比较破碎，缺乏整体的逻辑框架。而且在智能体探索文章内容时，前几轮的总结往往比较浅显，缺乏深度和细节。

也尝试过让模型在前几轮没有搞清楚内容前不输出总结（要求关于文章内容的几个关键问题被解答了才开始输出报告），但结果往往是智能体拒绝输出总结，直到循环轮次用尽，因为它认为一直没有找到足够的信息来回答关键问题。（这可能也与召回工具的设计有关，后续章节我们会再讨论）。

## 协调多智能体 (coordinating multi-agent)

ReAct Agent 可以实现自主的阅读策略，但是我觉得缺少了可控性。比如我想让智能体重点关注文章的方法部分，或者实验结果部分，这些都是 ReAct Agent 难以显式控制的。那么我实现了一个多智能体系统，来实现更可控和体系化的文章理解，能并行处理文章的不同部分。

### 系统架构

{{< mermaid >}}
flowchart LR;
    A[文章]
    B[规划 Agent]
    C1[元数据抽取 子Agent]
    C2[方法分析 子Agent]
    C3[实验结果 子Agent]
    C4[价值评估 子Agent]
    D[总结 Agent]
    E[最终报告]

    A --> B
    A --> C1
    A --> C2
    A --> C3
    A --> C4
    B -->|触发| C1
    B -->|触发| C2
    B -->|触发| C3
    B -->|触发| C4
    C1 --> D
    C2 --> D
    C3 --> D
    C4 --> D
    D --> E

    style A fill:#E3F2FD,stroke:#2196F3,stroke-width:2px,color:#0D47A1
    style B fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100
    style C1 fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100
    style C2 fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100
    style C3 fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100
    style C4 fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100
    style D fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100
    style E fill:#E8F5E9,stroke:#43A047,stroke-width:2px,color:#1B5E20
{{</mermaid>}}

1. **工作规划**：有一个负责规划的智能体，负责设计阅读计划并分配任务给各个子智能体。这个计划中不一定所有智能体都参与，每个智能体也只会阅读特定的部分。
    
    负责规划的智能体会让它扮演学术研究协调专家，专门分析学术论文并确定最有效的分析策略。它需要理解论文的内容和领域，从而制定最佳分析计划。具体而言，这个智能体会先分析摘要，以把握论文的领域和类型；接着检查章节名称，并推断每个章节可能包含的内容。在此基础上，它会确定哪些专家分析最具价值，并为每种分析类型仔细挑选所有相关章节，确保包括必要内容的同时避免无关部分。在规划时，这个智能体会考虑论文领域，如理论计算机科学、实证研究或综述，并评估摘要中可能存在的关键信息。它会优先选择能提供最有价值洞察的分析，确保整体分析既全面又聚焦，仅挑选包含必要内容的章节，并排除对特定分析无意义贡献的部分。

2. **任务分解**：将复杂的阅读任务分解成多个子任务，由不同的智能体并行处理。每个智能体设计了不同的提示词，专注于文章的某个方面。
    实现的系统中共设计了六个子智能体：

    - **元数据抽取**：提取论文标题、作者、机构、发表情况。
    - **相关工作分析**：分析研究背景、相关工作、局限性和独特贡献。
    - **研究问题识别**：识别核心问题、假设、贡献和影响。
    - **方法论分析**：分析技术方法、实验设计、假设和再现性。
    - **实验分析**：分析实验设置、结果、指标和发现。
    - **未来方向**：探讨局限性、未来研究和影响。

3. **结果整合**：最后由一个总结智能体将各个子智能体的输出进行整合，生成最终的报告并确保报告结构清晰，内容连贯。

协调多智能体系统显式地定义了每个智能体的职责和任务，确定了每个方面预期的风格和深度。但是称他为多智能体系统还有点牵强。按 Pydantic AI 的多智能体范式列出的，这种形式叫 Agent delegation （智能体委派），各个子智能体并没有真正的交互行为，都是独立完成任务然后将结果返回给总结智能体。

## 小结

以上介绍了三种不同复杂度的智能体系统设计：单体 Agent、ReAct Agent 和协调多智能体系统。每种设计都有其适用场景和优势。其实还有一个讨论多智能体系统 (discussion multi-agent system)的设计，但是太复杂了，留在下一篇文章中介绍。

关于三个系统的结果，我制作了一个可视化的工具，其中选择了不同领域，不同形式（实验类、综述类等）的论文进行展示。 你可以在下面的链接中查看这些智能体系统对不同论文的理解和报告生成效果： [SciRead Viewer](https://ecwuuuuu.com/special-topic/sciread-viewer)

[^1]: Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K. R., & Cao, Y. (2022, October). React: Synergizing reasoning and acting in language models. In The eleventh international conference on learning representations. [https://doi.org/10.48550/arXiv.2210.03629](https://doi.org/10.48550/arXiv.2210.03629)