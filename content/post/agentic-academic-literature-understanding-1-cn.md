---
title: 关于智能体的实验 1 - 三种阅读理解学术文献的智能体框架
subtitle:
author: Zhenghao Wu
description: 
featureimage:
unsplashfeatureimage:

publishDate: "2025-12-03T17:00:00+00:00"
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

> ## TL;DR
> 本文介绍了三种不同复杂度的智能体系统设计：单体 Agent、ReAct Agent 和协调多智能体系统。每种设计都有其适用场景和优势。

## 单体 Agent (single-agent)

我打算实现的第一个智能体系统是一个单体智能体，直接复刻我之前在 Cherry Studio 中实现的效果：让一个智能体阅读一篇学术文章，并生成一份详细的报告。使用 PydanticAI 实现 Agent 很简单。创建对象时定义好使用的模型，系统提示词和任务指令，调用 `run` 方法传入文章内容就可以了：

```python
# 我在下面的代码示例中使用了 DeepSeek 提供的模型，也列出了我使用的提示词设计。
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

这种更像是“封装了 LLM 的函数”，能否称之为智能体还有点争议。但从功能上来说，它包含了输入处理、任务指令和输出生成的完整流程，符合智能体的基本定义。

这个单体智能体生成报告的质量取决于选用的模型和提示词设计。这里使用的提示词我受到 Reddit 上的[一个讨论](https://www.reddit.com/r/notebooklm/comments/1i5028w/comment/m84k66j/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button)的启发。使用费曼技巧（Feynman Technique）来理解文章内容，并且以作者的视角来写报告。

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

## ReAct 智能体 (ReAct Agent)

> 在介绍其他智能体之前，先提一下 Document 模块，它是实现来获取文章内容的类，解析了文本之后，提供全文、章节获取接口，方便智能体选择性地读取文章内容，而不是一次性地处理整个文档。这个模块会在后续章节介绍和讨论。

ReAct（Reasoning and Acting）是 2022 年 Google Research 提出的一个范式，发表于论文 ReAct: Synergizing Reasoning and Acting in Language Models [^1]。文中将显式推理（Reasoning）与行动执行（Acting）结合起来，使模型能够在「思考 → 行动 → 观察」的循环中逐步完成复杂任务。
在 ReAct 中，模型不会直接给出最终答案，而是通过多轮推理和与外部环境交互（如调用工具、执行操作）逐步逼近解决方案{{% sidenote "react-tool-sidenote" %}}一般的 ReAct Agent 的 Acting 部分是调用外部工具（比如搜索引擎、代码执行等）；在这个文章阅读任务中，行动为获取文章内容。{{% /sidenote %}}。

我实现的 ReAct 智能体在提示词中允许它自主决定阅读策略：

1. 【思考】初始状态下，智能体会获得文章的前三个段落 （一般是文章标题、摘要、引言部分）的内容和所有章节名称的列表。智能体首先应该理解文章的类型，生成初步的阅读计划。
2. 【行动】智能体会根据计划获取文章的章节，进行阅读理解和分析。
3. 【思考】“阅读“了内容后，智能体需要生成以下几个内容（多个字段是一次请求输出的，利用了 Pydantic `BaseModel` 结构化）
   - **刚刚阅读内容的总结**：这是最后报告的一部分，报告生成的方式是将每次阅读的总结片段拼接在一起。
   - **接下来读什么（阅读计划）**：决定下一步阅读哪些段落。
   - **是否结束阅读**：判断是否已经完成了阅读，是否继续阅读。
   - **思考过程**：为什么要做出上面的决定。
4. 【行动】根据阅读计划，智能体获取下一批章节内容，进入下一轮循环。
5. 重复步骤 3 和 4，直到 智能体 判断完成阅读，即 `是否结束` 字段为`是`。
6. 最后，智能体生成最终的报告。{{%sidenote "react-agent-figure-explain" %}}
需要注意的是，下图中的`智能体规划`和`执行文段阅读`并不是两次独立的调用。ReAct 的过程是外部循环控制的。也就是说，智能体在每次生成中会决定下一步的行动（阅读哪个段落），然后外部系统会解析并获取段落内容返回给智能体（有点类似智能体通过工具调用 Tool Use 执行动作，环境反馈执行的结果或者环境的最新状态），智能体接着进行下一轮生成，形成一个循环；直到智能体决定任务完成。
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

ReAct 智能体对比 Simple 智能体的优势是，它可以在阅读过程中动态调整阅读策略：例如综述类文章，智能体可以略过方法部分；或者在阅读了方法部分后，觉得不够清晰，可以去 Appendix 查阅更多细节。配合高效的文章内容获取工具的支持下，能实现优化阅读效率的同时，提升文章理解的深度和广度。同时，ReAct 的**思考-行动循环**也显式地展现了智能体的"推理"过程，让生产报告的过程更加透明。

但从实验结果来看，ReAct 智能体的劣势是报告缺少清晰的结构，内容连贯性较差，往往是“想到哪说到哪“。因为我们是让智能体每次阅读一个片段后即生成阅读报告片段，最后再将这些总结拼接在一起，结构上往往比较破碎，缺乏整体的结构。

我也尝试调整提示词让模型在没有搞清楚内容前不要输出总结（列出了几个通用的关键问题，当收集足够信息后才开始生成报告），但结果是智能体一直输出空白总结，直到循环轮次用尽。这种情况是它认为一直没有找到足够的信息来回答关键问题。（这可能也与召回工具的实现有关，后续我们再讨论）。

## 协调多智能体 (coordinating multi-agent)

ReAct 智能体可以实现自主的阅读策略，但是我觉得缺少了可控性。比如我想让智能体重点关注文章的方法部分，或者实验结果部分，这些都是 ReAct 智能体难以显式控制的。为此我实现了一个多智能体系统，来实现更可控和体系化的文章理解，能并行处理文章的不同部分。

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

1. **工作规划**：有一个负责规划的智能体，负责设计阅读计划并分配任务给各个子智能体（专家）。这个计划中不一定所有智能体（专家）都参与，会根据计划触发，每个智能体（专家）也只阅读分配的部分文段。
    
    负责规划的智能体在提示词中让它扮演**学术研究协调专家**，专门分析学术论文并制定一个分析策略。
    
    具体来说，这个智能体会先分析摘要，以把握论文的领域和类型；接着检查章节名称，并推断每个章节可能包含的内容。在此基础上，它会确定哪些专家具有调用的价值，并为每一位专家仔细挑选需阅读的章节，避免无关部分。

    举个例子：如果论文是实验类的，规划智能体可能会选择“方法分析专家”和“实验结果专家”；如果是综述类的，可能会选择“相关工作专家”和“未来方向专家”。

2. **任务分解**：将复杂的阅读任务分解成多个子任务，由不同的智能体并行处理。每个智能体设计了不同的提示词，专注于文章的某个方面。
    实现的系统中共设计了六个子智能体：

    - **元数据抽取**：提取论文标题、作者、机构、发表情况。
    - **相关工作分析**：分析研究背景、相关工作、局限性和独特贡献。
    - **研究问题识别**：识别核心问题、假设、贡献和影响。
    - **方法论分析**：分析技术方法、实验设计、假设和再现性。
    - **实验分析**：分析实验设置、结果、指标和发现。
    - **未来方向**：探讨局限性、未来研究和影响。

3. **结果整合**：最后由一个总结智能体将各个子智能体（专家）的输出进行整合，生成最终的报告并确保报告结构清晰，内容连贯。

协调多智能体系统显式地定义了每个智能体的职责和任务，确定了每个专家智能体预期的风格和深度。按 Pydantic AI 的多智能体范式列出的，这种形式叫 Agent delegation （智能体委派），各个子智能体并没有真正的交互行为，都是独立完成任务然后将结果返回给总结智能体。称他为多智能体系统还有点牵强。

## 小结

以上介绍了三种不同复杂度的智能体系统设计：单体智能体、ReAct 智能体 和协调多智能体系统。每种设计都有其适用场景和优势。下一章我们将介绍**讨论多智能体系统 (discussion multi-agent system)** 和 **On-Demand 按需生成专家-协调多智能体系统**的设计与实现。

关于三个系统的结果，我制作了一个可视化的工具。挑选了不同领域，不同形式（实验类、综述类等）共十篇文章展示摘要报告。你可以通过下面的链接中查看报告生成效果： [SciRead Viewer](https://ecwuuuuu.com/special-topic/sciread-viewer)

[^1]: Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K. R., & Cao, Y. (2022, October). React: Synergizing reasoning and acting in language models. In The eleventh international conference on learning representations. [https://doi.org/10.48550/arXiv.2210.03629](https://doi.org/10.48550/arXiv.2210.03629)