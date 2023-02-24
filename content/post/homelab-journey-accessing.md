---
title: Homelab：我的赛博积木 - 访问
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/ahi73ZN5P0Y/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjY1ODQ4NTQ2&force=true&w=2400
unsplashfeatureimage: Federico Beccari

publishDate: "2023-02-25T02:20:00+08:00"
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
- FRP
- Synology QuickConnect
- Tailscale


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

前面已经介绍了基础设施和已经部署的服务。对于部署在[公网的服务](/post/homelab-journey-internet/)，访问是方便的。在 Nginx 中通过反向代理将容器服务绑定在域名上，再配上 SSL 证书就可以实现安全方便的服务访问体验。真正让人头疼的是内网服务的访问和访问控制。

## 保证数据中枢 NAS 的可达

我之前就[尝试通过](/post/nas-ipv6-ddns/) IPv6 公网使得 NAS 上面的服务公网可达。作为自己的数据中枢，为了他的可达性。我用过这些方案：

- Synology QuickConnect
- FRP (Fast Reverse Proxy)
- IPv6
- Tailscale

### Synology QuickConnect

[Synology QuickConnect](https://kb.synology.cn/zh-cn/DSM/tutorial/What_are_the_differences_between_QuickConnect_and_DDNS) 是群晖 DSM 内带的远程访问工具，使用它访问 NAS 还会自动识别内外网环境，内网自动直连。他最大的优势是配置简单,你只需要在配置中开启该功能并设置 QuickConnect ID 就能直接使用。但有两个显著的缺点：1. 能访问的服务有限，只支持最基础的系统功能。2. 在中国大陆体验尚可，但就笔者 20-21 年在香港的体验来说，该服务绝大多数时间不可用。

### IPv6

通过 IPv6 访问 NAS 难度不算太高，一般光猫处配置 IPv6 透传再将防火墙打开即可。现在手机连接流量后大多时候都有 IPv6 访问，这样就可以使用 IPv6 地址或 DDNS 后的域名访问。我之前使用领势无线路由器桥接拨号，在深圳实习时通过 IPv6 稳定的远程串流 NAS 资源长达一个月，但这之后某一时点后就无法访问到了，需要重启家庭网络和设备才能回复，具体原因未查明。

后来更换光猫了不再进行桥接，无线路由仅作 AP 使用，IPv6 也稳定了很多，其他 IPv6 客户端请求内容可以将上行跑满，也不再有经历过访问中断的情况。但需要注意的时，使用容器部署的服务，服务需要使用 Host 网络才能通过 IPv6 + 端口号访问到，否则只能内网访问。


### FRP

FRP 是后来配置来作为 IPv6 访问补充的工具。最早知道 FRP 是还在大二，学校信息中心明确说明不能使用反向代理打通内外网。要实现 FRP 转发内网流量需要服务端 frps 和客户端 frpc 两个组件。两侧会建立起长连接来来保持通信，然后服务端会监听来自公网的请求。服务端接受外部请求且 frpc 可连通时，服务端会将 frpc 请求来源（client）的流量进行双向转发。转发在请求断开时就会结束。简单来说它通过公网的中转机器实现内网流量的转发。本身 fprs 的部署也需要你有一台带公网的设备，但市面上有很多 fpr 服务提供商，很多还提供免费额度（比如我用过的 [SAKURA FRP](https://www.natfrp.com/)），这样只需要在需要反向代理的设备上部署 frpc 就可以实现内网的穿透。

最多的时候，我代理出了三个服务：DSM，EMBY 媒体服务，Apache Guacamole™ 远程桌面工具。但是国内的 frps 提供商说不上稳定，速度也差强人意。在免费使用了一年多，也尝试付费节点近半年的事件后，我最后放弃了 FRP 方案。

### Tailscale

Tailscale 是 [Lau](cklau.cc) 介绍的工具，他是基于 Wireguard 构建，力求易用。

- 它通过第三方服务的认证来登录，在设备上登录后就可以将设备添加进自己的组网里。然后 Tailscale 会自动处理用于加密点对点通信的密钥分发和配置。
- 大多时候，通信通过 NAT 穿透实现；但当穿透无法实现时，Tailscale 的中继服务会介入。

Tailscale 的效果非常惊艳，连接上就可以访问组网内的其他设备，不需要特别的配置，设备就如同在同一个内网。在 OpenWRT 连接并配置好相应的端口和防火墙后，网关下的设备还能无需连接，直接访问组网内的设备。

> 未完待续