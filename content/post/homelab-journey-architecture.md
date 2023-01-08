---
title: Homelab：我的赛博积木 - 组成与架构
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/US9Tc9pKNBU/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8Mnx8YnVpbGRpbmclMjBibG9ja3xlbnwwfHx8fDE2NjU4MTc3OTI&force=true&w=2400
unsplashfeatureimage: Ryan Quintal

publishDate: "2023-01-08T23:17:00+08:00"
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
- Images
- Service
- Self-host
- Architecture

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


## 架构概览

经常能在 r/homelab 上看到 "[LabPorn](https://www.reddit.com/r/homelab/?f=flair_name%3A%22LabPorn%22)" 里其他大佬的机架。虽然很眼红，但目前自己的 HomeLab 只是几个简单的独立设备/资源组成。包括腾讯轻量云实例，群晖 NAS 和工控机。

## 内网

我的地址在粤港澳大湾区，并在常住的广州和中山配有两台设备。

-----

广州是一台[群晖的 DS918+](https://cndl.synology.cn/download/Document/Hardware/DataSheet/DiskStation/18-year/DS918+/chs/Synology_DS918_Plus_Data_Sheet_chs.pdf)，J3455 CPU 配 12G RAM（原装 4G + 后装 8G）。保持官方最新 DSM 系统并配有四块硬盘，总共有效存储 24T。

- 两块 4T 西数红盘做 RAID 1 储存过去的照片、文件等比较重要的信息。
- 一块 4T 西数红盘做 BASIC 存储来折腾。
- 一块 16T 西数 HC550 做 BAISC 来存储多媒体资源。

大多情况下使用 DSM 内带的 Docker 部署服务，小部分会使用官方制作的 spk 包安装（如 EMBY 和 Tailscale）。

-----

在中山是 J4125 四口 2.5GB 的工控机。配有 16G RAM，120G mSTAT 固态。使用 ESXi 7.0 作为底层 hypervisor。

- 一个 Ubuntu 22.04 虚拟机，部署日常服务。
- 一个 OpenWRT 做旁路由。

在 Ubuntu 虚拟机上，使用了基于 Containerd 的容器服务，然后使用 [Caddy](https://caddyserver.com/) 做服务代理。

## 公网

公网上的服务使用了两台腾讯云 Lighthouse 虚拟机，系统基于 CentOS。

- 4C4G 广州 峰值带宽 8M
- 2C4G 香港 峰值带宽 30M

两台设备选装了腾讯云的宝塔定制版面板，关闭了在线面板的访问。
