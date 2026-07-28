---
title: 关于智能体的实验 2 - RAG 支持的支撑片段检索
subtitle:
author: Zhenghao Wu
description: 
featureimage:
unsplashfeatureimage:

publishDate: "2026-07-28T22:17:00+01:00"
lastmod: 
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: true
math: true
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

> 这个章节构思了挺久，代码也在一直改。
>
> 主要是纠结本身就成熟复杂的 RAG 系统很难在我这样一个短的篇幅里讲出新意。最后决定侧重在“支撑片段检索“（Evidence Retrieval）这个角度。

## RAG 速成介绍

RAG（Retrieval-Augmented Generation）做的事情可以简述为：先把文档切成可以检索的 chunk 并建立索引（Embedding）；收到问题后，从索引用余弦相似度找出若干相关 chunk；最后把这些内容连同问题一起交给语言模型生成答案。所以检索召回的内容决定了生成的完整性和准确性。

但这个过程存在许多变量，“RAG 召回得好不好”很难只靠几次生成的结果来判断。因此会从多个角度考虑：

- 召回：回答问题所需的证据是否全部进入候选？
- 排序：真正相关的证据是否排在前面，而不是排的很后？
- 上下文干不干净：在含有必要证据 chunk 中，是否混入了弱相关或无关的文字？

这三个问题也是后面所有实验的出发点。

## 支撑片段检索

在问答、事实核验和可解释推理等 NLP 任务中，寻找能够支撑答案的原文证据，通常被建模为 Evidence Retrieval 或 Supporting-fact Selection 任务。相关方法既包括文档和段落级检索，也包括句级证据筛选；不少工作还会训练或微调专门的 retriever 和 selector。

RAG 的情况有些不同。它返回的是 chunk 文段，而不是已经判断好的“证据句”。一个 chunk 可能只和问题主题相关，也可能只包含了答案的一半，甚至可能只是出现了几个高频词。所以，通用 RAG 并不能保证返回内容里一定有我们想要的证据。

不过我觉得，可以通过调节参数，让返回的 chunk 尽可能高质量。这里讨论的 Evidence Retrieval 更像是整个 RAG 系统最终表现出来的一种性质：切片决定证据边界是否完整，召回策略决定候选池里有没有它，排序和 rerank 决定它能否进入前几名，邻居扩展负责补回跨边界的结论，Agent 的提问方式和返回格式则决定这些片段最后能不能被当作证据使用。

这一章节是从 RAG 参数和 Agent 提示词入手，让通用 RAG 更适合论文理解场景。

## 实验基线和指标

首先需要一套能核对原文的测试题。我围绕 *Attention Is All You Need* 整理了 30 个中英文问题，并为每个问题标出回答时必须出现的原文片段，一共 41 条。

```json
{
  "id": "aiayn-001",
  "question": "What is the central architectural innovation of the Transformer?",
  "question_zh": "Transformer 的核心架构创新是什么？",
  "answer": "It is a sequence transduction architecture based solely on attention mechanisms, without recurrence or convolutions.",
  "answer_zh": "它是一种完全基于注意力机制、舍弃循环和卷积的序列转换架构。",
  "question_type": "factoid",
  "difficulty": "easy",
  "evidence": [
    {
      "id": "aiayn-001-e1",
      "section": "Abstract",
      "pdf_page": 1,
      "role": "required",
      "quote": "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely."
    }
  ]
}
```

评价指标包括：

- Question Recall@K：一道题所需的全部 evidence 都到齐才算成功。
- Evidence Recall@K：41 条 gold span 中有多少被覆盖，用来定位具体漏项。
- [MRR](https://zh.wikipedia.org/wiki/平均倒数排名)：第一个相关结果出现得有多早。Recall 相同时，MRR 更高意味着 Agent 更少在噪声中寻找答案。
- 平均上下文字符数：最终交给 Agent 的字符数，决定了成本。


基线从 SciRead 的默认行为开始：200–2000 字符切片，不做 overlap，使用 lexical scorer，取前 5 个结果。

结果并不算差。30 个问题里，96.7% 能在前 5 个结果中找到完整证据。但继续看排序就会发现问题：MRR 只有 69.7%；其中一个表格问答，真正需要的段落排到了第 22。

这意味着目前的 RAG 能大体召回正确的片段，但片段排名靠后。那么我们有两个目标：1. 先把证据排得尽量靠前。2. 设法减少最终上下文长度。

## 实验 1 + 2：排序算法和 chunk 尺寸

我们先看最基础的 lexical 检索出了什么问题。

论文里有很多不能随便改写的字面信息，比如 $d_k$、softmax、表格编号、模型名和数值。Semantic 检索适合找意思相近的内容，但这些精确词仍然需要 lexical 来兜底。问题在于，旧 scorer 对查询里的每个词给出近似固定的奖励。what、the、of 和 dropout、positional、key 的分量差不多；它也不知道某个词在全文里是否随处可见，也不会考虑段落的长度。

于是我把这部分用 [BM25](https://en.wikipedia.org/wiki/Okapi_BM25) 进行改进。先去掉提问句里的虚词（[停用词](https://zh.wikipedia.org/wiki/停用词)），再用 [IDF](https://en.wikipedia.org/wiki/Tf–idf) 抑制高频词的权重；最后按照 chunk 长度做归一化，免得长段落因为包含的词而高分。

保持 2000 字符窗口不变，替换为这个 BM25-like scorer。Question Recall@5 和 Evidence Recall@5 都维持在 96.7% 和 97.6%，MRR 则从 69.7% 提升到 83.6%。

{{< vegalite caption="不同 chunk 窗口与 Lexical 排序策略的检索质量。点的位置表示 chunk 上限和 MRR，颜色与形状区分排序及 overlap 策略；悬停可查看 Recall、chunk 数和上下文量。" label="Chunk 窗口、Lexical 策略与检索质量散点图" >}}
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 420,
  "title": {
    "text": "Chunk 窗口、Lexical 策略与检索质量",
    "subtitle": "Top-5；初始基线为原始 scorer / 2000 / overlap 0"
  },
  "data": {
    "values": [
      {"config": "legacy · 800 · o0", "strategy": "原始 scorer · overlap 0", "chunk_size": 800, "overlap": 0, "chunk_count": 82, "question_recall": 76.7, "evidence_recall": 82.9, "mrr": 63.7, "average_context_characters": 3110.4},
      {"config": "legacy · 1000 · o0", "strategy": "原始 scorer · overlap 0", "chunk_size": 1000, "overlap": 0, "chunk_count": 65, "question_recall": 80.0, "evidence_recall": 82.9, "mrr": 65.8, "average_context_characters": 3732.2},
      {"config": "legacy · 1200 · o0", "strategy": "原始 scorer · overlap 0", "chunk_size": 1200, "overlap": 0, "chunk_count": 55, "question_recall": 80.0, "evidence_recall": 82.9, "mrr": 63.7, "average_context_characters": 4035.0},
      {"config": "legacy · 1600 · o0", "strategy": "原始 scorer · overlap 0", "chunk_size": 1600, "overlap": 0, "chunk_count": 46, "question_recall": 83.3, "evidence_recall": 85.4, "mrr": 58.4, "average_context_characters": 5370.3},
      {"config": "legacy · 2000 · o0", "strategy": "原始 scorer · overlap 0", "chunk_size": 2000, "overlap": 0, "chunk_count": 37, "question_recall": 96.7, "evidence_recall": 97.6, "mrr": 69.7, "average_context_characters": 6453.9},
      {"config": "legacy · 800 · o120", "strategy": "原始 scorer · overlap 120", "chunk_size": 800, "overlap": 120, "chunk_count": 82, "question_recall": 80.0, "evidence_recall": 85.4, "mrr": 63.2, "average_context_characters": 3686.9},
      {"config": "legacy · 1000 · o120", "strategy": "原始 scorer · overlap 120", "chunk_size": 1000, "overlap": 120, "chunk_count": 65, "question_recall": 83.3, "evidence_recall": 87.8, "mrr": 65.7, "average_context_characters": 4354.9},
      {"config": "legacy · 1200 · o120", "strategy": "原始 scorer · overlap 120", "chunk_size": 1200, "overlap": 120, "chunk_count": 55, "question_recall": 83.3, "evidence_recall": 87.8, "mrr": 64.9, "average_context_characters": 4645.2},
      {"config": "legacy · 1600 · o120", "strategy": "原始 scorer · overlap 120", "chunk_size": 1600, "overlap": 120, "chunk_count": 46, "question_recall": 90.0, "evidence_recall": 92.7, "mrr": 61.3, "average_context_characters": 5974.1},
      {"config": "legacy · 2000 · o120", "strategy": "原始 scorer · overlap 120", "chunk_size": 2000, "overlap": 120, "chunk_count": 37, "question_recall": 93.3, "evidence_recall": 95.1, "mrr": 67.7, "average_context_characters": 6985.1},
      {"config": "bm25 · 800 · o0", "strategy": "BM25-like · overlap 0", "chunk_size": 800, "overlap": 0, "chunk_count": 82, "question_recall": 90.0, "evidence_recall": 92.7, "mrr": 83.9, "average_context_characters": 2917.1},
      {"config": "bm25 · 1000 · o0", "strategy": "BM25-like · overlap 0", "chunk_size": 1000, "overlap": 0, "chunk_count": 65, "question_recall": 86.7, "evidence_recall": 90.2, "mrr": 80.6, "average_context_characters": 3811.9},
      {"config": "bm25 · 1200 · o0", "strategy": "BM25-like · overlap 0", "chunk_size": 1200, "overlap": 0, "chunk_count": 55, "question_recall": 90.0, "evidence_recall": 92.7, "mrr": 80.0, "average_context_characters": 4057.9},
      {"config": "bm25 · 1600 · o0", "strategy": "BM25-like · overlap 0", "chunk_size": 1600, "overlap": 0, "chunk_count": 46, "question_recall": 96.7, "evidence_recall": 97.6, "mrr": 81.9, "average_context_characters": 5110.6},
      {"config": "bm25 · 2000 · o0", "strategy": "BM25-like · overlap 0", "chunk_size": 2000, "overlap": 0, "chunk_count": 37, "question_recall": 96.7, "evidence_recall": 97.6, "mrr": 83.6, "average_context_characters": 6759.1}
    ]
  },
  "mark": {
    "type": "point",
    "filled": true,
    "size": 68,
    "opacity": 0.88
  },
  "encoding": {
    "x": {
      "field": "chunk_size",
      "type": "quantitative",
      "title": "最大 chunk 字符数",
      "scale": {"domain": [750, 2050], "nice": false},
      "axis": {"values": [800, 1000, 1200, 1600, 2000]}
    },
    "y": {
      "field": "mrr",
      "type": "quantitative",
      "title": "MRR（%）",
      "scale": {"domain": [55, 86], "zero": false, "nice": false}
    },
    "color": {
      "field": "strategy",
      "type": "nominal",
      "title": "排序策略",
      "scale": {
        "domain": ["原始 scorer · overlap 0", "原始 scorer · overlap 120", "BM25-like · overlap 0"],
        "range": ["#3B82F6", "#F59E0B", "#10B981"]
      }
    },
    "shape": {
      "field": "strategy",
      "type": "nominal",
      "title": "排序策略",
      "scale": {
        "domain": ["原始 scorer · overlap 0", "原始 scorer · overlap 120", "BM25-like · overlap 0"],
        "range": ["circle", "triangle-up", "square"]
      }
    },
    "tooltip": [
      {"field": "config", "type": "nominal", "title": "实验配置"},
      {"field": "chunk_size", "type": "quantitative", "title": "最大 chunk 字符数"},
      {"field": "chunk_count", "type": "quantitative", "title": "chunk 数"},
      {"field": "overlap", "type": "quantitative", "title": "overlap 字符数"},
      {"field": "question_recall", "type": "quantitative", "title": "Question Recall", "format": ".1f"},
      {"field": "evidence_recall", "type": "quantitative", "title": "Evidence Recall", "format": ".1f"},
      {"field": "mrr", "type": "quantitative", "title": "MRR", "format": ".1f"},
      {"field": "average_context_characters", "type": "quantitative", "title": "平均上下文字符数", "format": ".1f"}
    ]
  },
  "config": {
    "axis": {"labelFontSize": 12, "titleFontSize": 13},
    "legend": {"orient": "bottom", "direction": "horizontal", "labelLimit": 240},
    "view": {"stroke": null}
  }
}
{{< /vegalite >}}

然后我们来看 chunk 尺寸的影响。

直觉上，更小的 chunk 可以让证据更集中，也能减少最终上下文长度；但 chunk 越小，候选就越多。窗口从 2000 缩到 800 后，这篇论文从 37 个 chunk 变成 82 个。Question Recall@5 降到了 76.7%。加入 120 字符 overlap 能补回一部分被切断的原文，但没有明显改善 MRR。说明这个情况下，较弱的 scorer 无法把真正相关的片段排到前面。

也可以看到 BM25-like 在这组压力测试里稳定得多。五种窗口下的 MRR 都在 80.0% 到 83.9% 之间；在 800 字符窗口上，Question Recall@5 从 76.7% 回到 90.0%，MRR 从 63.7% 提升到 83.9%。

到这里得到的结论是：小 chunk 确实能让证据更集中，但更依赖排序器的性能。BM25-like 排序器确实更适合论文问答场景。

## 实验 3：精排

BM25-like 改善了顺序，但 800 字符窗口的 Question Recall@5 仍然只有 90%。这时有两个很直接的办法：把 Top‑K 调大，或者退回 2000 字符的大 chunk。但我们之前提过，这样做那不如直接把整篇文章丢进去。

搜索引擎处理的是同一种矛盾。有限的处理时间不允许逐一处理索引中的所有文档。搜索引擎工程中则会分粗排和精排两步。粗排追求速度和覆盖率：先用便宜、互补的信号快速缩小范围，允许候选中混入少量噪声，但尽量不要漏掉可能相关的内容（要求高召回率）。精排面对这批有限候选，因此可以花更多计算量，逐一比较查询和候选，再决定最终顺序。

我觉得要进一步提升 scorer 效果也要用类似思路。这一轮也沿用了这个思路：粗排阶段同时使用 lexical、semantic 和论文的章节结构：lexical 负责公式名、术语和数值等精确匹配，semantic 补充不同说法下的语义相近内容，Section Tree 则利用论文自身的章节关系。三路结果经过 [RRF 合并](https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking)去重，最多保留 30 个候选。随后，reranker 同时阅读问题和每个候选 chunk，重新判断哪些片段最可能支撑回答，最终只把排在前面的证据和必要的邻居上下文交给 Agent。

{{<mermaid>}}
flowchart TD;
  A[Lexical + Semantic + Section Tree] --> B[RRF 合并去重]
  B --> C["候选池(最多 30)"]
  C --> D[BAAI/bge-reranker-v2-m3]
  D --> E[Top Evidence]
{{</mermaid>}}

Reranker 能比向量检索的 cosine similarity 排得更细，关键在于两者读取文本的方式不同。向量检索通常先分别把问题和 chunk 压缩成两个固定长度的向量，再计算它们的夹角。这样速度很快，文档向量也可以提前建好索引；但问题和原文在编码时没有见到彼此，一些细节会在压缩过程中丢失。两个段落只要主题接近，就可能得到很高的相似度，即使其中一个没有回答问题真正问到的关系、条件或结论。

Reranker 使用的是交互式的打分方式：把问题和候选 chunk 放进同一次模型计算中，让问题里的 token 与原文里的 token 直接发生注意力交互，然后输出这一对文本的相关性分数。模型因此可以进一步判断某个术语是否真的出现在回答所需的上下文里，区分“讨论了 dropout”和“给出了 dropout 实验结论”，也更容易识别否定、数值、比较关系以及跨句指代。代价是每个候选都要跑一次模型，无法像向量一样预先算好，所以只适合用在有限的候选上。

这个 score 仍然表示问题与片段的相关程度，高分不等于“证据确凿”。

{{< vegalite caption="加入 hybrid rerank 后，三个 chunk 窗口的 Question Recall 都达到 100%；1200 字符窗口的 MRR 最高。横轴括号中是论文切分后的 chunk 数。" label="Rerank 下不同 chunk 窗口的 Question Recall 与 MRR 分组柱状图" >}}
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 360,
  "title": {
    "text": "Rerank 下的 chunk 窗口对比",
    "subtitle": "Top-5、neighbor=1；横轴为最大字符数 / chunk 数"
  },
  "data": {
    "values": [
      {"chunk_config": "800 / 82", "chunk_size": 800, "chunk_count": 82, "metric": "Question Recall", "score": 100.0},
      {"chunk_config": "800 / 82", "chunk_size": 800, "chunk_count": 82, "metric": "MRR", "score": 89.7},
      {"chunk_config": "1200 / 55", "chunk_size": 1200, "chunk_count": 55, "metric": "Question Recall", "score": 100.0},
      {"chunk_config": "1200 / 55", "chunk_size": 1200, "chunk_count": 55, "metric": "MRR", "score": 92.2},
      {"chunk_config": "2000 / 37", "chunk_size": 2000, "chunk_count": 37, "metric": "Question Recall", "score": 100.0},
      {"chunk_config": "2000 / 37", "chunk_size": 2000, "chunk_count": 37, "metric": "MRR", "score": 91.1}
    ]
  },
  "layer": [
    {
      "mark": {"type": "bar", "cornerRadiusEnd": 2},
      "encoding": {
        "x": {
          "field": "chunk_config",
          "type": "nominal",
          "title": "最大 chunk 字符数 / chunk 数",
          "sort": ["800 / 82", "1200 / 55", "2000 / 37"]
        },
        "xOffset": {"field": "metric"},
        "y": {
          "field": "score",
          "type": "quantitative",
          "title": "得分（%）",
          "scale": {"domain": [0, 100]}
        },
        "color": {
          "field": "metric",
          "type": "nominal",
          "title": "指标",
          "scale": {
            "domain": ["Question Recall", "MRR"],
            "range": ["#3B82F6", "#F59E0B"]
          }
        },
        "tooltip": [
          {"field": "chunk_size", "type": "quantitative", "title": "最大 chunk 字符数"},
          {"field": "chunk_count", "type": "quantitative", "title": "chunk 数"},
          {"field": "metric", "type": "nominal", "title": "指标"},
          {"field": "score", "type": "quantitative", "title": "得分", "format": ".1f"}
        ]
      }
    },
    {
      "mark": {"type": "text", "dy": -7, "fontSize": 12},
      "encoding": {
        "x": {
          "field": "chunk_config",
          "type": "nominal",
          "sort": ["800 / 82", "1200 / 55", "2000 / 37"]
        },
        "xOffset": {"field": "metric"},
        "y": {"field": "score", "type": "quantitative"},
        "text": {"field": "score", "type": "quantitative", "format": ".1f"},
        "detail": {"field": "metric"}
      }
    }
  ],
  "resolve": {"scale": {"x": "shared", "y": "shared"}},
  "config": {
    "axis": {"labelFontSize": 12, "titleFontSize": 13},
    "legend": {"orient": "bottom", "direction": "horizontal"},
    "view": {"stroke": null}
  }
}
{{< /vegalite >}}

加入 rerank 后，800、1200、2000 三种窗口的完整召回都达到 100%。1200 字符窗口的 MRR 最高，为 92.2%。

## 调整 Top-K 控制上下文

到这一步，完整证据已经能够稳定找回。接下来的问题变成：最终到底需要给 Agent 多少内容？

{{< vegalite caption="1200 字符 chunk 下，不同 Top-K、邻居窗口和问题语言的上下文量与排序质量。颜色区分问题语言，形状区分是否补邻居；悬停可查看 Recall 与 Evidence 密度。" label="平均上下文量与 MRR 的多维散点图" >}}
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 400,
  "title": {
    "text": "召回质量与最终上下文量",
    "subtitle": "1200 字符 chunk；比较 Top-K 与邻居窗口"
  },
  "data": {
    "values": [
      {"config": "EN · K5 · n1", "point_label": "EN K5 n1", "language": "English", "top_k": 5, "neighbor_window": 1, "neighbor": "补 1 个邻居", "avg_context_chars": 8589.67, "mrr": 92.22, "question_recall": 100.0, "evidence_recall": 100.0, "gold_block_density": 20.0},
      {"config": "EN · K3 · n1", "point_label": "EN K3 n1", "language": "English", "top_k": 3, "neighbor_window": 1, "neighbor": "补 1 个邻居", "avg_context_chars": 4931.6, "mrr": 92.22, "question_recall": 100.0, "evidence_recall": 100.0, "gold_block_density": 33.33},
      {"config": "ZH · K5 · n1", "point_label": "ZH K5 n1", "language": "中文", "top_k": 5, "neighbor_window": 1, "neighbor": "补 1 个邻居", "avg_context_chars": 8758.13, "mrr": 93.33, "question_recall": 100.0, "evidence_recall": 100.0, "gold_block_density": 20.0},
      {"config": "ZH · K3 · n1", "point_label": "ZH K3 n1", "language": "中文", "top_k": 3, "neighbor_window": 1, "neighbor": "补 1 个邻居", "avg_context_chars": 4892.7, "mrr": 93.33, "question_recall": 100.0, "evidence_recall": 100.0, "gold_block_density": 33.33},
      {"config": "EN · K5 · n0", "point_label": "EN K5 n0", "language": "English", "top_k": 5, "neighbor_window": 0, "neighbor": "不补邻居", "avg_context_chars": 4581.13, "mrr": 91.78, "question_recall": 93.3, "evidence_recall": 95.1, "gold_block_density": 20.0}
    ]
  },
  "layer": [
    {
      "mark": {
        "type": "point",
        "filled": true,
        "size": 82,
        "opacity": 0.9
      },
      "encoding": {
        "x": {
          "field": "avg_context_chars",
          "type": "quantitative",
          "title": "平均上下文字符数",
          "scale": {"domain": [4400, 9000], "zero": false, "nice": false}
        },
        "y": {
          "field": "mrr",
          "type": "quantitative",
          "title": "MRR（%）",
          "scale": {"domain": [91.5, 93.6], "zero": false, "nice": false}
        },
        "color": {
          "field": "language",
          "type": "nominal",
          "title": "问题语言",
          "scale": {
            "domain": ["English", "中文"],
            "range": ["#3B82F6", "#F59E0B"]
          }
        },
        "shape": {
          "field": "neighbor",
          "type": "nominal",
          "title": "邻居窗口",
          "scale": {
            "domain": ["补 1 个邻居", "不补邻居"],
            "range": ["circle", "triangle-up"]
          }
        },
        "tooltip": [
          {"field": "config", "type": "nominal", "title": "配置"},
          {"field": "avg_context_chars", "type": "quantitative", "title": "平均上下文字符数", "format": ".1f"},
          {"field": "mrr", "type": "quantitative", "title": "MRR", "format": ".2f"},
          {"field": "top_k", "type": "quantitative", "title": "Top-K"},
          {"field": "neighbor_window", "type": "quantitative", "title": "Neighbor window"},
          {"field": "question_recall", "type": "quantitative", "title": "Question Recall", "format": ".1f"},
          {"field": "evidence_recall", "type": "quantitative", "title": "Evidence Recall", "format": ".1f"},
          {"field": "gold_block_density", "type": "quantitative", "title": "Gold block density", "format": ".2f"}
        ]
      }
    },
    {
      "mark": {"type": "text", "dx": 8, "dy": -8, "align": "left", "fontSize": 11},
      "encoding": {
        "x": {
          "field": "avg_context_chars",
          "type": "quantitative",
          "scale": {"domain": [4400, 9000], "zero": false, "nice": false}
        },
        "y": {
          "field": "mrr",
          "type": "quantitative",
          "scale": {"domain": [91.5, 93.6], "zero": false, "nice": false}
        },
        "text": {"field": "point_label", "type": "nominal"}
      }
    }
  ],
  "resolve": {"scale": {"x": "shared", "y": "shared"}},
  "config": {
    "axis": {"labelFontSize": 12, "titleFontSize": 13},
    "legend": {"orient": "bottom", "direction": "horizontal"},
    "view": {"stroke": null}
  }
}
{{< /vegalite >}}

这可以靠调整 Top-K 和邻居窗口来控制。K 越大，召回越高，但上下文也越长；目前当我们 Scorer 和 Reranker 都足够强时较小的 K 就能保证完整召回。

我先把 Top‑5 改成 Top‑3，并保留一个相邻 chunk。英文问题的平均上下文从 8589.7 降到 4931.6 字符，中文从 8758.1 降到 4892.7；两种语言的 Recall 和 MRR 都没有下降。也就是说，rerank 已经把重要内容排到了足够靠前的位置。

然后尝试把相邻 chunk 也去掉。上下文确实更小了，但 Question Recall 降到 93.3%，Evidence Recall 降到 95.1%。检查漏项后发现，命中的 chunk 有时只是结论的开头，剩余部分落在紧邻的下一块里。

因此真正适合削减的是 Top‑K，而不是邻居扩展。最后保留 Top‑3 和一个邻居：只在命中后补一点局部上下文，比让每个 chunk 从一开始就大量重叠更节省。

## Agent 要调整什么

我们正在这个章节基于 ReAct Agent 派生了 RAG ReAct Agent。主要是将原本的章节工具更换为了 RAG 检索工具。

除了这个改动，Agent 的提示词也需要调整。原本的提示词是针对章节工具设计的，假设每个章节都是完整的证据；但 RAG 返回的 chunk 可能只是证据的一部分，甚至可能只是出现了几个高频词。Agent 需要知道：如果用 RAG 工具才能找到完整证据；如何判断 chunk 是否包含了完整证据；如果没有，如何继续提问。

这需要 Agent 具备一定的推理能力。它需要理解问题和 chunk 的关系，判断 chunk 是否包含了完整证据，并在必要时提出进一步的问题以获取缺失的信息。这种能力可以通过设计更复杂的提示词和训练数据来增强。

## 小结

这一轮实验最终并没有得到一个可以适用于所有论文的“最佳 RAG 配置”，但它说明了一个更重要的问题：RAG 的效果不能只看最后生成的答案，还需要单独检查答案之前的证据链路。

在这组实验中，检索系统经历了几个比较明确的变化：

- BM25-like scorer 改善了精确术语、公式和数值相关片段的排序；
- hybrid retrieval 扩大了候选证据的覆盖范围；
- reranker 将真正能够支撑回答的片段推到了更靠前的位置；
- Top-3 加一个相邻 chunk，在保持完整召回的同时，明显减少了交给 Agent 的上下文长度。

这些结果也表明，chunk size、召回和排序不能被分开看待。较小的 chunk 可以减少噪声，却更容易切断证据，也会对排序器提出更高要求；较大的 chunk 更容易覆盖完整内容，但会带来更长的上下文。邻居扩展（Overlapping）则提供了一种折中方式：不必让所有 chunk 从一开始就大量重叠，而是在命中之后补回有限的局部上下文。

不过，这里真正重要的并不是最终选择了 1200 字符、Top-3 或一个 120 字符的 overlapping chunk。这些数值只是在当前论文和测试集上的实验结果，换一篇论文、换一种问题分布，结论都可能发生变化。

更值得保留的是这套评测方法：为问题标注回答所需的原文证据，然后分别测量证据有没有被召回、排在什么位置，以及最终向 Agent 提供了多少上下文。

有了这样的 Ground Truth，RAG 就不再只是一个依赖直觉调整参数的黑箱。某个问题回答错误时，我们可以进一步判断：是切片切断了证据，粗排没有召回，reranker 排错了顺序，还是 Agent 没有正确使用已经找到的内容。
