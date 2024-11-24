---
title: Barrelfish OS 和多内核操作系统
subtitle: Barrelfish OS and Multi-kernel Operating System
author: Zhenghao Wu
description: Barrelfish OS and Multi-kernel Operating System
featureimage: 
unsplashfeatureimage: 

publishDate: "2019-01-09T12:56:01+08:00"
lastmod: 
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: true
math: false
gallery: false
showinfocard: true
enablecomment: false

series:

confidence: highly likely
importance: 8

tags:
- OS
- Operating System
- Barrelfish OS
- Multi-kernel
- ETH Zurich
- UIC
- Computer Science

categories:
- Note
- OS

# type: file, link, image, and others
extramaterials:
- type: link
  name: Barrelfish Operating System Homepage
  url: http://www.barrelfish.org/index.html
- type: file
  name: "Original Paper on Barrelfish OS - The Multikernel: A new OS architecture for scalable multicore systems"
  url: http://www.barrelfish.org/publications/barrelfish_sosp09.pdf
- type: link
  name: "An article from Microsoft about this topic - Barrelfish: Exploring a Multicore OS"
  url: https://www.microsoft.com/en-us/research/blog/barrelfish-exploring-multicore-os/

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

大三的上学期有一门专业课叫操作系统（Operating System），它的课程小组项目是对某个操作系统进行研究。我们组抽到了 Barrelfish Operating System。

<!--more-->

{{< figure
  src="https://cdn.ecwuuuuu.com/blog/image/barrelfish-logo.jpg"
  type="full"
  label="Barrelfish OS Logo"
  title="Barrelfish OS Logo"
  alt="Barrelfish OS Logo"
 >}}
{{< section "end" >}}

这是一个试验操作系统，几乎从零开始设计，并提出了许多全新的概念。虽然官方网站上给出了许多文档，我们依然花了许多时间来理解这个系统的架构。

## 什么是 Barrelfish OS

### 背景

Barrelfish OS 是由苏黎世联邦理工大学{{< figure
  src="https://cdn.ecwuuuuu.com/blog/image/ETHzurich-logo.png"
  class="class param"
  type="margin"
  label="mn-rhino"
  title="ETH Zurich Logo"
  label="eth"
 >}}
{{< section "end" >}}系统小组（ETH Zurich Systems Group）与微软剑桥研究院（Microsoft Research Cambridge）于 2007 年开始研究开发的实验操作系统（这种操作系统主要被研究者用于实践提出的新概念或想法）。

### 现状
系统到目前为止依然有更新，最新的一次版本（Release）是在 2018 年 10 月 4 日发布的（添加了对 Ubuntu 18.04 LTS 作为构建环境的支持）。

虽然经过了多年的开发，这个系统远达不到可用的地步。运行需要 QEMU，而且非常不稳定。{{% sidenote "sn-unstable" %}}我构建安装的 Barrelfish OS，运行提供的 `demo` 演示程序就会崩溃 🤨；从来没有成功拉起过网卡驱动。（当然也可能跟我迷醉的运行方式有关：在 macOS 上通过 Teamviewer 远程至一个 Windows 台式机上 VirtualBox 软件上的 Ubuntu 18.04 虚拟机；在虚拟机中运行 QEMU 模拟的 Barrelfish OS）{{% /sidenote %}}

### 特点
Barrelfish OS 最大的特点就是多内核（Multikernel）。研究者认为目前的操作系统不是为拥有大量运算核心的计算机而设计的，同时多核心处理器是未来运算芯片的趋势（因为提高时钟速度来提高性能也会造成更大的功耗和发热）。Barrelfish OS 就是为了更好的利用多核芯处理器计算机而出现的。虽然有些国内的媒体听见风就是雨以为这个微软参与的项目会诞生一个替代 Windows 的产品，但需要注意的是，Barrelfish OS 并不是 Windows 的替代品，它只是为了实践提出的新概念或想法，这也正是实验操作系统的意义。

## 多内核架构（Multikernel Architecture）
{{< figure
  src="https://www.microsoft.com/en-us/research/wp-content/uploads/2016/10/multikernel-model.jpg"
  class="class param"
  title="The Multikernel model"
  caption="Support heterogeneous cores to work together"
  label="tmm"
  attr="Microsoft Research"
  attrlink="https://www.microsoft.com/en-us/research/blog/barrelfish-exploring-multicore-os/"
  alt="alt"
 >}}
{{< section "end" >}}


Barrelfish OS 研究人员面临的主要挑战是可扩展性，包括硬件核心的拓展和异构硬件（如何将 ARM 的芯片和 Intel 的芯片一起管理）的拓展。

研究人员提出了多内核（Multikernel）的概念。与传统的一个内核负责管理调度所有的核心不同，多内核是在每一个核心上都运行一个独立的内核，该内核只负责调度这一核内的资源，不同的内核之间再显式的进行通信（不直接进行通信）。

Barrelfish OS 上的内核被称为 CPU Driver (核心处理器驱动)。它是一个单线程且不可被抢占的程序，会承担调度程序在 CPU 上运行的行为。

## 程序在 Barrelfish OS 上运行

{{< figure
  src="https://i.loli.net/2019/09/02/n7sP5GDLjkm4XUz.png"
  class="class param"
  
  title="Interactions between Barrelfish’s core components"
  caption="Dissertation figure in: "
  label="ibbcc"
  attr="A JVM for the Barrelfish Operating System"
  attrlink="https://people.eecs.berkeley.edu/~maas/maas-bathesis.pdf"
  alt="alt"
 >}}
{{< section "end" >}}

程序（Program）在传统的操作系统上运行是通过进程（Process）的形式。而 Barrelfish OS 是通过 Dispatcher 的形式。

一个程序运行后以一个 Dispatcher 的形式运行在 CPU 中，如果一个程序有多个进程同时运行，那么则会有多个 Dispatcher 运行在多个 CPU 上。Dispatcher 要做的是指定一个线程并让该线程运行。

多个 Dispatcher 形成一个 Domain（域）的概念，进而会涉及到域之间通信的问题（类似程序间通信，用的是一种类似 RPC 的通信方法），但是这篇文章中不会涉及这个内容。

因为核心之间不能直接进行通信，所以 Monitor 被引入了（这个 Monitor 与同步问题中的管程不同）。程序可以通过 Monitor 进行核之间的信息交流。

总结一下，CPU Driver 会调度 Dispatcher 运行，Dispatcher 再调度一个线程运行。Dispatcher 和线程都可以被抢断。

## 内存
> 我们没有将内存研究的非常深，这里只根据我的理解，简单的介绍。

Barrelfish OS 从 [seL4](https://sel4.systems){{< figure
  src="https://sel4.systems/images/logo-text-white.svg"
  class="class param"
  type="margin"
  label="sel4"
  title="seL4 Logo"
 >}}
{{< section "end" >}}引入了 Capability。因为运行在 CPU 上的程序不能直接访问内存，所以它们通过访问 Capabilities Reference 并通过逐层的 CNode 索引，最后找到 Capability。最后再通过 Capability 找到最终的物理内存地址。

Capability 的引入有一定的原因是为了安全的内存访问。

## 安装 Barrelfish OS
我是在一个 Ubuntu 18.04 的虚拟机上构建的 Barrelfish OS，构建时依照了[官方维基](http://wiki.barrelfish.org/Getting_Started)内提供的步骤，不要遗漏一些包文件就不会在构建时遇到问题。

运行时遇到了比较多的问题，包括网卡设置不匹配，模拟器无法启动。最后在 [@lmy441900](https://www.github.com/lmy441900) 和 [@DRJ31](https://www.github.com/DRJ31) 的帮助下，我们安装了 QEMU，并通过 QEMU 模拟了一个两核心的电脑运行 Barrelfish OS。

## 总结
这篇文章并不是对 Barrelfish OS 的完整概述，只是我在学期结束后的假期里，对这个小组作业的小小回顾。{{% sidenote "sn-uncover" %}}像内核之间的通信，核内的通信，两种抢占机制，Capability 索引的细节，系统管理硬件的方式，这里都没有提到。{{% /sidenote %}}

就像菲利普教授说的 "Barrelfish is fun."， 研究深入后确实能体会这个系统的乐趣，但同时也因为多内核这种全新的架构设计所引入的新概念和解决方案，让初学者很难快速理解整个系统。如果你正在研究这个系统，我能给的一点小建议是：好好利用官方提供的 [Glossary （术语表）](http://www.barrelfish.org/publications/TN-001-Glossary.pdf)。

Barrelfish 不能成为下一个 Windows。但它能像官网里展望所说的，它能成为未来多核 / 多内核操作系统的研究平台，为多内核操作系统奠基。

---
The group project mentioned in this article was completed by Zhenghao Wu (@ECWU), Turing Qiu ([@yfqiu98](https://github.com/yfqiu98)), and Otto Zhang ([@zhanggzzy](https://github.com/zhanggzzy))