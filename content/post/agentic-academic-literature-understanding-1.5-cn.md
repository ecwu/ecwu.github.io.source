---
title: 关于智能体的实验 1.5 - 阅读理解学术文献的多智能体框架（第四种）
subtitle:
author: Zhenghao Wu
description: 
featureimage:
unsplashfeatureimage:

publishDate: "2025-11-05T17:11:00+08:00"
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


copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

> 接着上篇文章，本文介绍一种更复杂的多智能体系统设计，实现了智能体间的动态交互和讨论行为。

## 讨论多智能体系统 (discussion multi-agent system)

上面的多智能体系统设计并不存在实际的智能体间通信机制，协调者只是简单地分配任务和收集结果。为了实现真正的多智能体交互行为，我设计了一个允许智能体间提问和回应的讨论系统。

协调多智能体系统虽然能够并行处理文章的不同部分，但各个智能体之间缺乏交流。这就像是让几个专家各自独立阅读论文，然后简单地把他们的笔记拼在一起。虽然能覆盖多个角度，但缺少了真正的学术讨论中最有价值的部分：**质疑、辩论和共识的形成**。

真实的学术讨论中，专家们会互相提问、挑战对方的观点、澄清误解，并在这个过程中逐步达成更深入的理解。讨论多智能体系统就是为了模拟这种动态的学术讨论过程。

### 系统架构

讨论多智能体系统包含两个关键方面：整体的讨论流程和智能体间的交互机制。

#### 讨论流程

整个系统从接收文章开始，经过多轮讨论迭代，最终生成综合报告：

{{< mermaid >}}
flowchart TB
    Start([开始])
    Input[输入文章]
    Init[初始化讨论状态]
    
    Phase1[阶段1: 初始分析<br/>4个智能体并行生成洞察]
    
    Phase2[阶段2: 提问<br/>智能体审查洞察并提问]
    
    Phase3[阶段3: 回应<br/>智能体回答问题]
    
    Check{收敛检查<br/>是否达成共识?}
    
    IterCheck{是否超过<br/>最大迭代次数?}
    
    Phase4[阶段4: 共识构建<br/>识别共识点和分歧点]
    
    Output[生成最终报告]
    End([结束])
    
    Start --> Input
    Input --> Init
    Init --> Phase1
    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Check
    
    Check -->|未收敛| IterCheck
    IterCheck -->|否| Phase2
    IterCheck -->|是| Phase4
    
    Check -->|已收敛| Phase4
    Phase4 --> Output
    Output --> End
    
{{</mermaid>}}

#### 智能体交互架构

四个性格化智能体通过任务队列系统进行异步协作和讨论：

{{< mermaid >}}
flowchart TB
    subgraph Agents [智能体生态]
        A1[批判评估者<br/>Critical Evaluator]
        A2[创新洞察者<br/>Innovative Insighter]
        A3[实践应用者<br/>Practical Applicator]
        A4[理论整合者<br/>Theoretical Integrator]
    end
    
    subgraph TaskSystem [任务队列系统]
        TQ[任务队列<br/>Task Queue]
        TM[任务管理器<br/>最多4个并发任务]
        
        subgraph TaskTypes [任务类型]
            T1[生成洞察]
            T2[提问]
            T3[回应]
            T4[收敛评估]
        end
    end
    
    Coord[讨论协调器<br/>Discussion Coordinator]
    Doc[文章文档<br/>Document]
    Consensus[共识构建器<br/>Consensus Builder]
    
    Doc --> Coord
    Coord --> TQ
    TQ --> TM
    
    TM --> T1 & T2 & T3 & T4
    
    T1 -.分配给.-> A1 & A2 & A3 & A4
    T2 -.分配给.-> A1 & A2 & A3 & A4
    T3 -.分配给.-> A1 & A2 & A3 & A4
    T4 -.分配给.-> A1 & A2 & A3 & A4
    
    A1 & A2 & A3 & A4 -.完成任务.-> TQ
    
    TQ --> Coord
    Coord --> Consensus
    
    style Coord fill:#FFF3E0,stroke:#FB8C00,stroke-width:3px
    style Doc fill:#E3F2FD,stroke:#2196F3,stroke-width:2px
    style Consensus fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px
    style TQ fill:#FFF9C4,stroke:#FBC02D,stroke-width:2px
    style TM fill:#FFF9C4,stroke:#FBC02D,stroke-width:2px
    style A1 fill:#FCE4EC,stroke:#E91E63,stroke-width:2px
    style A2 fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px
    style A3 fill:#E8EAF6,stroke:#3F51B5,stroke-width:2px
    style A4 fill:#E0F2F1,stroke:#009688,stroke-width:2px
    style T1 fill:#E1F5FE,stroke:#03A9F4,stroke-width:1px
    style T2 fill:#E1F5FE,stroke:#03A9F4,stroke-width:1px
    style T3 fill:#E1F5FE,stroke:#03A9F4,stroke-width:1px
    style T4 fill:#E1F5FE,stroke:#03A9F4,stroke-width:1px
{{</mermaid>}}

在这个架构中：
- **讨论协调器**负责创建和分发任务
- **任务队列系统**管理所有待执行的任务，支持并发执行和优先级控制
- **四个智能体**从任务队列中获取任务，完成后将结果返回
- 智能体之间不直接通信，而是通过任务系统间接交互（一个智能体的输出会成为另一个智能体任务的输入）
- **共识构建器**在讨论结束后收集所有结果，生成最终报告

系统由以下几个核心模块组成：

#### 1. 四个性格化智能体

每个智能体都有独特的分析视角和人格特质：

- **批判评估者 (Critical Evaluator)**：专注于识别方法论缺陷、实验设计问题和研究局限性。扮演质疑者的角色，确保分析的严谨性。
- **创新洞察者 (Innovative Insighter)**：关注论文的创新点、突破性贡献和未来研究方向。善于发现论文中的新颖之处和潜在影响。
- **实践应用者 (Practical Applicator)**：评估研究的实际应用价值、实施可行性和产业影响。从工程和应用的角度审视论文。
- **理论整合者 (Theoretical Integrator)**：分析理论框架、概念贡献以及研究在更广阔知识体系中的位置。关注理论一致性和概念清晰度。

每个智能体有专门的系统提示词定义其性格，还会维护自己的对话历史，使得它们在讨论过程中能够保持一致的立场和逻辑连贯性。

#### 2. 任务队列系统

讨论系统使用任务队列来管理智能体的工作。任务类型包括：

- `GENERATE_INSIGHTS`：生成初步洞察
- `ASK_QUESTION`：向其他智能体提问
- `ANSWER_QUESTION`：回答问题
- `MONITOR_CONVERGENCE`：评估讨论收敛程度

任务系统支持并发执行（最多 4 个任务同时运行）、优先级管理和超时控制，确保讨论过程高效且不会陷入无限循环。

#### 3. 讨论协调器

协调器负责整个讨论流程的编排，它会：
- 初始化讨论状态和任务队列
- 管理讨论阶段的转换
- 监控讨论进度和收敛情况
- 决定何时结束讨论

#### 4. 共识构建器

当讨论达到收敛后，共识构建器会：
- 识别智能体间的共识点
- 提取有分歧的观点
- 综合所有洞察生成最终报告
- 评估分析结果的置信度

### 讨论流程

整个讨论过程分为五个阶段，形成一个迭代循环：

{{< mermaid >}}
flowchart LR
    A[初始分析]
    B[提问阶段]
    C[回应阶段]
    D[收敛评估]
    E[共识构建]
    F[完成]
    
    A --> B
    B --> C
    C --> D
    D -->|未收敛| B
    D -->|已收敛| E
    E --> F
    
    style A fill:#E3F2FD,stroke:#2196F3,stroke-width:2px
    style B fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px
    style C fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px
    style D fill:#FFF9C4,stroke:#FBC02D,stroke-width:2px
    style E fill:#E8F5E9,stroke:#43A047,stroke-width:2px
    style F fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px
{{</mermaid>}}

#### 阶段 1：初始分析 (Initial Analysis)

每个智能体独立分析文章。与协调多智能体不同的是，这里的智能体会**自主选择要阅读的章节**。

流程是这样的：
1. 智能体首先获得文章标题、摘要和所有可用章节的列表
2. 根据自己的性格特点，决定阅读哪些章节（比如批判评估者可能会重点读方法和结果部分）
3. 获取选定章节的内容后，生成 2-3 个最重要的洞察

每个洞察包含：
- 洞察内容
- 重要性评分（0.0-1.0）
- 置信度评分（0.0-1.0）
- 支持证据
- 引发的问题

#### 阶段 2：提问阶段 (Questioning)

智能体们开始互相提问。这个阶段很有意思，因为智能体会**主动决定是否需要提问**。

提问流程：
1. 每个智能体审查其他智能体的洞察
2. 根据自己的专业视角，判断是否有必要提问
3. 如果认为有价值，就构造一个具体的问题

智能体可以选择 `ask`（提问）或 `skip`（跳过）。只有当问题能够真正推进讨论、解决疑虑或发现矛盾时，智能体才会提问。这避免了为了提问而提问的情况。

问题类型包括：
- `clarification`：澄清型，要求解释不清楚的地方
- `challenge`：挑战型，质疑洞察的有效性
- `extension`：延伸型，探讨更深层次的含义

#### 阶段 3：回应阶段 (Responding)

被提问的智能体需要回应问题。回应不仅仅是回答，还可能导致智能体修正自己的观点。

回应内容包括：
- 详细的回答内容
- 立场（同意/不同意/澄清/修正）
- 修正后的洞察（如果需要）
- 回应的置信度

这个机制允许智能体在讨论中**学习和调整自己的理解**，就像真实的学术讨论一样。

#### 阶段 4：收敛评估 (Convergence)

协调器会评估讨论是否已经收敛。评估指标包括：

- **一致性**：智能体的洞察是否越来越一致
- **完整性**：重要方面是否都被充分讨论
- **解决度**：主要矛盾是否得到处理
- **稳定性**：洞察是否不再发生重大变化

每个智能体也会给出自己的收敛评分。如果平均收敛评分达到阈值（默认 0.75）或达到最大迭代次数（默认 5 次），就进入共识构建阶段。否则，返回提问阶段继续讨论。

#### 阶段 5：共识构建 (Consensus)

最后，共识构建器会：

1. **识别共识点**：哪些观点得到了多个智能体的支持
2. **提取分歧点**：哪些地方仍然存在显著的不同看法
3. **生成综合报告**：
   - 论文概述和主要贡献
   - 共识性的评价
   - 有争议的观点及各方理由
   - 整体意义和影响评估
   - 置信度评分

### 关键设计特点

#### 1. 智能体的自主性

每个智能体维护自己的对话历史（`message_history`），使得它们在多轮对话中能够：
- 记住之前说过的话
- 保持逻辑一致性
- 根据讨论进展调整策略

#### 2. 动态的讨论控制

系统实现了多个终止条件：
- 达到最大迭代次数（防止无限讨论）
- 超过时间限制（默认 30 分钟）
- 收敛评分达到阈值
- 洞察不再发生实质性变化

#### 3. 结构化的数据模型

使用 Pydantic 定义了清晰的数据结构：
- `AgentInsight`：智能体的洞察
- `Question`：问题对象，包含优先级和类型
- `Response`：回应对象，包含立场和修正
- `ConsensusPoint`：共识点，记录支持和反对的智能体
- `DivergentView`：分歧观点，记录冲突的理由

#### 4. 任务并发执行

使用异步任务队列实现并发：
- 初始分析阶段：4 个智能体并行生成洞察
- 提问阶段：多个提问任务并行执行
- 回应阶段：多个回应任务并行处理

这大大提高了效率，避免了串行执行的时间浪费。

### 实现挑战

实现这个系统遇到了一些有趣的挑战：

1. **过度提问问题**：早期版本中，智能体会对每个洞察都提问，导致讨论冗长。解决方法是在提示词中明确要求智能体**只在必要时提问**，并增加了 `skip` 选项。

2. **循环依赖**：智能体在提问和回应时需要访问彼此的状态，这可能导致循环依赖。通过使用事件驱动的任务系统和缓存机制解决。

3. **收敛判断**：如何判断讨论已经"足够好"是个难题。最终采用了多维度评估（一致性、完整性、解决度、稳定性）并结合智能体自评的方式。

4. **性能优化**：为了避免重复创建智能体实例，实现了智能体缓存机制（`get_agent_cache_status`），但需要在会话结束时手动清理（`clear_agent_cache`）。

### 与其他模式的对比

相比前面的方法：

- **vs 单体 Agent**：讨论系统能够从多个角度分析，并通过智能体间的质疑和辩论达到更深入的理解。
- **vs ReAct Agent**：讨论系统的"思考"过程是分布式的，多个智能体并行思考并互相挑战，而不是单一智能体的线性推理。
- **vs 协调多智能体**：增加了真正的智能体间交互，不再是简单的任务分配和结果汇总，而是动态的讨论过程。

讨论多智能体系统更接近真实的学术研讨会：多位专家围绕一篇论文展开讨论，互相提问、质疑、澄清，最终形成一个更全面、更平衡的评价。这种方式特别适合需要深度分析和多角度评估的复杂学术文献。

[^1]: Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K. R., & Cao, Y. (2022, October). React: Synergizing reasoning and acting in language models. In The eleventh international conference on learning representations. [https://doi.org/10.48550/arXiv.2210.03629](https://doi.org/10.48550/arXiv.2210.03629)