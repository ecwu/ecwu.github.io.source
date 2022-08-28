---
title: Homelab：我的赛博积木
subtitle: 前言和总览
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/DH5183gvKUg/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjYxNjU4MzEw&force=true
unsplashfeatureimage: Will Porada

publishDate: "2022-08-28T03:43:40Z"
lastmod: 
draft: true
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
  caption="使用 Homarr 构建"
  label="rb67-pic"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

我在 2020 年中购入了群晖的 918+ NAS，这并不是我第一次提起这台设备，但它确实这个系列文章的起源。刚开始只是基于群晖的 DiskStation Manager 使用，对数据进行备份、使用 Video Station 对收藏的媒体进行串流。