+++
title = "LaTeX 模版初体验"
description = "关于制作 LaTeX 模版的一些小笔记"
date = 2019-06-28T00:04:50+08:00
tags = ["LaTeX"]
categories = ["Note"]
draft = true
menu = "main"
+++

> 最近做了个给 FYP 做了个模版，于是在这里记录一点心得。

<!--more-->

# 原因

到了即将步入大四的这个暑假，期末考刚结束就要继续做FYP（我们系在大三下学期期末考结束后的暑假，会要求留校一段时间进行 FYP）。

FYP 前前后后会要求提交多个文档：

- Literature Review（类似文献综述）
- Thesis Draft（半成品 Thesis）
- 最终的 Thesis

但种种迹象表明，系里提供的 Thesis 模版（Word）年久失修，样式混乱，且使用时可能会出现奇怪的事情（本人就在写 Literature Review 的时候，**因模版原因导致保存失败，丢失过一部分数据。**）

于是我和 [@以俊德](https://lmy441900.github.io) 就计划着将这套模版重制，并提供两个版本：Word 和 LaTeX。我就负责 LaTeX 的部分。

# 借鉴

因为是第一次写 LaTeX 的模版，又由于网上资源比较少，所以我首先想到的是借鉴。

## 借鉴 0：文件结构



## 借鉴 1：“开关指令”

在寒假参加 SemEval 2019 时，使用了 NAACL 2019 的模版，对里面的“最终版本”开关（即一个指令，该指令是否在文中出现会影响最终的文档样式）的设计印象很深刻。于是打算在模版中。

在原始的模版中，指令是这样使用的。

```TeX
\aclfinalcopy % Uncomment this line for the final submission
```
这一行原本是被注释了的，将这一行取消注释后，原本页面上的左右标尺，作者名，页眉的“请勿分发”，都发生了变化。

注释之前：
![注释之前](https://cdn.ecwuuuuu.com/blog/image/naacl-before.png)

注释之后：
![注释之后](https://cdn.ecwuuuuu.com/blog/image/naacl-after.png)

实现是这样的：

```TeX
\newif\ifaclfinal
\aclfinalfalse
\def\aclfinalcopy{\global\aclfinaltrue}
```

首先先定义了一个新的 `\newif` 条件语句叫 `aclfinal`