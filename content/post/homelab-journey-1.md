---
title: Homelab：我的赛博积木
subtitle: 前言和总览
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/DH5183gvKUg/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjYxNjU4MzEw&force=true
unsplashfeatureimage: Will Porada

publishDate: "2022-10-04T22:43:40+08:00"
lastmod: 
draft: false
status: In Progress
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: false
math: false
gallery: false
showinfocard: true
enablecomment: true

series: HomeLab
previous:
next:

confidence: 
importance: 9

tags:
- Homelab
- Docker
- Container
- Synology
- J4125
- Tencent Cloud
- Networking
- 组网
- FRP
- ddns

categories:
- Tech
- Website
- Network
- Cloud

# type: file, link, image, and others
extramaterials:
# - type: file
#   name: placeholder
#   url: #

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

HomeLab 直译是在家里的实验室，赛博语境下指网络、计算设备组成的实验沙盒。可以用来学习计算机技术和部署自用的服务。个人感觉 HomeLab 这个概念更多是在国外使用，许多的爱好者集中在 Reddit 频道 [r/homelab](https://www.reddit.com/r/homelab/) 分享、交流项目和问题；在 YouTube 上也有不少博主提供手把手教学视频。这个应对国内的概念应该是 NAS 和 All in One (All in Boom 😀)，许多教程能在什么值得买和哔哩哔哩找到。

{{< figure
  src="http://cdn.ecwuuuuu.com/blog/image/homelab/homelab-overview.jpg"
  class="class param"
  title="HomeLab 规模概览"
  caption="通过部署 Homarr 项目展示了大部分服务"
  label="rb67-pic"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

我在 2020 年初购入了群晖的 918+ NAS，这并不是我第一次提起这台设备，但它确实这个系列文章的起源。最开始只是围绕着群晖的 DiskStation Manager 使用：挂载在电脑上方便访问文件、进行数据备份，用 Video Station 对收藏的媒体进行串流、内网观看。

群晖内带的套件总体突出简单易用，但在媒体管理器内容刮削能力、下载工具速度等细节上，内带工具还是比较的弱。再加上我这台群晖是 x86 架构的，使用 Docker 非常简单。于是我就开始接触 Docker 容器。再之后自己的设备、虚拟机越来越多，建起的服务逐步增多。就像搭积木一样，到现在我已经依托四五个设备搭建了大大小小三四十个不同的服务。

这个系列的文章就是分享我玩 HomeLab 的心路历程：为什么我要玩 HomeLab，我用我的 HomeLab 做什么，对于一个需求我选择什么开源项目进行部署，你该如何开始玩 HomeLab，有哪些资源可以进行参考和学习...

希望通过记录我搭建赛博积木的过程，分享以前踩过的坑；更是让一些人认识到这个有趣的兴趣，一起折腾起来。对于系列里的内容，我计划有以下这些部分，列出来方便之后添加超链接进行索引。

- 组成与架构
- [内网服务](/post/homelab-journey-2/)
- 公网服务
- 通信方案
- 未来展望
