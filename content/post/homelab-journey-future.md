---
title: Homelab：我的赛博积木 - 展望
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/xU5Mqq0Chck/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8ZnV0dXJlfGVufDB8fHx8MTY4NDc3OTMxNHww&force=true&w=2400
unsplashfeatureimage: Drew Beamer

publishDate: "2023-10-07T02:20:00+08:00"
lastmod: "2024-10-04T14:30:00+01:00"
draft: false
status: Finished
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

confidence: likely
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
- Home Lab

# type: file, link, image, and others
extramaterials:
- type: link
  name: 「4K50｜装机 Log」拓展性拉满的 12 盘位个人服务器 HomeLab / NAS
  url: https://www.bilibili.com/video/BV1KV4y127wk

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

从“赛博积木”系列第一篇文章到现在，已经过了两年的时间。受自己需求、实际体验后的感受等多重因素的影响。现有的架构和最初的设计已经有了很大的变化。其中最大的变化应该是在 23 年 6 月新组装的个人服务器，直接影响了我许多服务的部署形式。

在这个系列最后一篇文章里，我打算介绍下围绕着这台服务器对我 Homelab 整体架构的影响；并且展望下还有什么东西可以在未来继续折腾。

## 个人服务器

### 硬件

先来介绍新组装的个人服务器。光它的选型花了半年的时间：最开始设想的是 ITX 4 盘位 NAS 配个星际蜗牛的壳子，但看到各种 NAS 主板价格高而拓展性又不足就开始看超微和华擎的服务器主板。后面又担心 CPU 的代数比较古老能效低，所以想选用 8 代以后的 CPU。中间还去挑选过戴尔 R740，R730 服务器、用笔记本 CPU 改的 12 代英特尔主板。最后还是参考了这一篇[什么值得买的文章](https://post.smzdm.com/p/an3n35rp/)，组装了一台 12 盘位的主机。具体配置如下图（价格仅供参考）

| 组件 | 型号 | 价格 |
| :--: | :--: | :--: |
| 主板 | ASUS Pro WS C422-ACE | 1399 |
| CPU | Intel Xeon W-2140B | 430 |
| RAM | 三星 DDR4-2400 ECC REG 16G * 4 | 106 * 4 |
| 散热 | 利民 AX120 R SE | / |
| 电源 | 先马黑钻 750W | / |
| 机箱 | 梵隆 12 盘位全高 NAS 机箱 | / |
| HBA 卡 | 浪潮 YZCA-00424-101 (LSI SAS3008) | / |
| SSD | 三星 PM9A1 512GB | / |
| 硬盘 | 希捷 EXOS 16T * 2，西数 HC550 16T * 2 | / |
| 显卡 | NVIDIA T400 2G | / |

> 组装视频： [Bilibili](https://www.bilibili.com/video/BV1KV4y127wk)
> 
> 本来是想着趁 2023 年 “6.18” 电子配件便宜时下单购买，但实际上真正有优惠的只有电源。最后在 6 月 15 号左右就集齐了所有配件进行了设备的组装，期间拍摄的视频趁着 6.18 进行了发布获得了还不错的观看。

这套配置主要考虑的是性能和强大的拓展性。主板可以安装 LGA 2066 的 CPU，支持 Reg-ECC 内存，有三个 PCIE 3.0 16x 的插槽。CPU 是当年苹果定制给 iMac Pro 使用的，选用的 W-2140B 是这系列的低配，8核16线程。最高可以升级到 W-2191B 18核36线程。机箱选用了梵隆的 12 盘位全高机箱，最高支持 ATX 主板，硬盘背板支持 SAS 和 SATA。

回看这套配置，选用的散热是不适配这个机箱的，AX120 的热管会稍高于机箱，未来需要更换为一个 3U 的风扇来避免热管和机箱的摩擦。

### 软件

为了更灵活的控制，服务器装了 Proxmox VE 7.0 的底座，再在上面创建虚拟机使用。

1. TrueNAS Scale 虚拟机直通了 HBA 卡，分配了 4 核心 32G 的内存。这个虚拟机负责管理硬盘并提供存储的接口。里面我将四块硬盘组成了 RAIDZ1 存储池，并提供出 NFS 和 Samba 的接口用来挂载到其他系统中。
2. Ubuntu 虚拟机分配了 8 核心 16G 的内存，主要是运行各种自用的服务。
3. Debian 虚拟机分配了 4 核心 14G 的内存，安装了[内网服务/半自动媒体中心](/post/homelab-journey-intranet/#半自动媒体中心)同款的下载器和内容刮削工具。
4. Ubuntu LXC 容器分配率 4 核心 8G 的内存，安装了 Emby，直通了显卡用于硬件解码。
5. OpenWRT 容器分配率 2 核心 2G 的内存。

大部分的虚拟机都配置了 Tailscale 用于访问和管理。Ubuntu LXC 容器使用 Wireguard 与 CN2 GIA 服务器组网，提高部分服务的访问速度。

因为腾讯云轻量香港的服务器继续续费比较贵，所以将大部分的服务都迁移到了 Ubuntu 虚拟机中，并通过 Tailscale 来访问，有较高的安全性，访问的体验也不错。必要时还可以之间 DERP 服务，以防无法穿透时带来的访问问题。

## 其他碎碎念

### Kubernetes

Kubernetes 是我在攒这台服务器时就设想着要使用的底座。但部署的服务和容器量一直没有达到使用 Kubernetes 的程度。虽然已经在一些实验环境安装了许多次，但实际情况下还是只部署一个 Docker Engine 用于运行容器。

但我认识的 [Terence Lau](https://blog.cklau.cc) 他就运行了一个 Kubernetes 集群，用于部署自己的服务。使用着也相当的顺畅，未来如果我的 HomeLab 继续扩大规模，我会考虑部署到 Kubernetes 上。

### 网络

现目前手上拿着的虚拟机只剩下 2C2G（两核，2G）的腾讯云广州，99元一年。这个服务器专门来用于跑 Authentik 用于鉴权（都已经有点吃力了）。但为了更消耗资源的服务的公网可达到性，现在都是运行在本地 NAS 或者服务器上，组网后再代理出去。这里根据服务选择了 Tailscale 或者 Wireguard 进行组网。下一步可能会考虑通过多出口的方式来提高各地理位置的访问速度。这里可以考虑的技术包括 GeoDNS、Anycast 等。

### 存储

现在的存储方案是使用 TrueNAS Scale 来管理硬盘，提供 NFS 和 Samba 的接口。在 24 年初的时候，当初选购的一块 16T 硬盘告警，找售后进行了更换（一年售后）。未来可以根据需求增添一台全闪存的 NAS，提升存储的速度。另外就是可以尝试搭建一个分布式存储系统，提高存储的可靠性。可以基于 Ceph 或者 GlusterFS 进行搭建。

### 自动化

玩 HomeLab 的过程中，我发现有很多重复的操作，比如安装软件、配置环境等。往往装好了就不想再去动它。感觉可以着手去自动化这些操作。包括利用 Ansible 来自动化配置。或者进一步的使用 Terraform 来管理云资源。应用基础设施即代码(Infrastructure as Code)的理念，将配置文件存储在 Git 仓库中，通过 CI/CD 工具来自动化部署。

### 监控

云对于个人用户一个问题就是，各种监控其实是挺耗费资源的。以前我会使用 node_exporter 部署在各个设备上，然后通过 Prometheus 来收集数据。但逐步的简化成用一个独立小主机来部署 uptime kuma 来监控各个服务和设备的状态。未来可以考虑使用 Grafana 云来收集展示监控数据。

### 安全

因为没有公网 IP，所以我一直没有部署 WAF 来保护自己的服务。但如果有机会，我会考虑部署一个 WAF 来保护自己的服务。另外就是可以考虑使用一些安全工具来扫描自己的服务，提高安全性。

综上，这篇文章是我对自己 Homelab 的展望。未来我会继续折腾，也会继续分享。希望这个系列的文章能够帮助到一些人，也希望能够和更多的人一起折腾。