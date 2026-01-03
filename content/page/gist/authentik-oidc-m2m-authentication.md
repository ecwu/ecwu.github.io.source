---
title: Authentik - OIDC M2M 认证
subtitle: 
author: Zhenghao Wu
description: 
featureimage: 
unsplashfeatureimage: 

publishDate: "2026-01-02T12:30:00+00:00"
lastmod: 
draft: false
status: 
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: true
toc: false
math: false
gallery: false
showinfocard: true
enablecomment: true

series: Gist
previous:
next:

confidence: 
importance: 

tags:
- Authentik
- M2M
- OIDC
- FRP

categories:
- Gist

# type: file, link, image, and others
extramaterials:


copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

FRP 是一款非常流行的反向代理工具，除了常规的密钥认证方式外，FRP [也支持 OIDC 认证](https://gofrp.org/zh-cn/docs/features/common/authentication/)。

在使用 Authentik 作为 OIDC 提供者时，FRP 作为 M2M 客户端应用程序进行认证的配置如下：

在 Authentik 中创建一个 OIDC 应用和对应的 Provider。

1. 通过 “Create with Provider” 创建 OIDC 应用和 Provider。应用的名称随便，重要的是记住 slug，一会在 FRPS 配置中会用到。
2. 在 Provider 的配置页面，类型选择 “OAuth2/OpenID Provider”。
3. 填写以下字段：
    - Provider Name: 随便
    - Authorization flow：default-provider-authorization-implicit-flow (这个 flow 不需要用户交互)
    - Client ID 和 Client Secret: 系统会自动创建，稍后会在 FRP 配置中使用
    - Signing Key: 选择一个已有的，因为需要 JWT 签名

4. 保存 Provider 配置。

接下来，在 FRP 客户端配置文件中使用刚刚创建的 OIDC 应用进行认证，我这边演示代理 TeamSpeak 3 服务器的配置。

在 FRP 客户端配置文件中，添加以下配置：

`frpc.toml`:

```toml
serverAddr = "填入你 frps 的服务器地址"
serverPort = 填入端口
auth.method = "oidc"
auth.oidc.clientID = "刚刚创建的 OIDC 应用的 Client ID"
auth.oidc.clientSecret = "刚刚创建的 OIDC 应用的 Client Secret"
auth.oidc.tokenEndpointURL = "https://你的 authentik 服务器地址/application/o/token/"

[[proxies]]
name = "TS3-Voice"
type = "udp"
localIP = "127.0.0.1"
localPort = 9987
remotePort = 9987

[[proxies]]
name = "TS3-Filetransfer"
type = "tcp"
localIP = "127.0.0.1"
localPort = 30033
remotePort = 30033
```

`frps.toml`:
```toml
bindPort = 填入端口
auth.method = "oidc"
auth.oidc.issuer = "https://你的 authentik 服务器地址/application/o/服务的 slug/"
```

保存配置后，启动 FRP 客户端和服务器，FRP 将通过 Authentik 进行 OIDC 认证交换访问令牌，从而实现安全的 M2M 认证。如果成功，你能在 Authentik 的应用 log 中看到一个 Login 事件，是由 `ak-m2m_provider-client_credentials` 的 service account 触发的。
