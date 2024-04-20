---
title: Authentik 教程系列：将应用通过 OIDC，SAML，LDAP 协议接入
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/AT5vuPoi8vc/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8aGFuZHNoYWtlfGVufDB8fHx8MTcxMzIwOTg2Mnww&force=true&w=2400
unsplashfeatureimage: charlesdeluvio

publishDate: "2024-04-19T19:29:00+08:00"
lastmod: 
draft: true
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: true
math: false
gallery: false
showinfocard: true
enablecomment: true

series: Authentik
previous:
next:

confidence: highly likely
importance: 

tags:
- Homelab
- Docker
- Container
- Images
- Service
- Self-host
- Authentication


categories:
- Tech
- Website
- Network
- Cloud

# type: file, link, image, and others
extramaterials:
# - type: link
#   name: Bilibili：Authentik 教程系列 - 部署自己的开源身份验证服务 - 介绍、安装和配置 - OAuth2, SAML, LDAP
#   url: https://www.bilibili.com/video/BV1pm41167WK/?spm_id_from=333.999.0.0

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

搭建了统一登录平台之后，最重要的事情就是将应用接入。Authentik 支持五种协议接入，分别是 [SAML 2.0](https://en.wikipedia.org/wiki/SAML_2.0)， [OAuth 2.0/OpenID Connect (OIDC)](https://openid.net/developers/how-connect-works/)， [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol)， [SCIM](https://scim.cloud)，和 [RADIUS](https://en.wikipedia.org/wiki/RADIUS)，其中 OIDC，SAML，和 LDAP 能覆盖我们大多数的接入需求。在这篇文章我将用具体应用示例的方式演示如何将应用接入 Authentik。

## Authentik 设计的架构（简化版）

我们先用一个很简化的模型来介绍我们会涉及到的几个概念。Authentik 内部维护有一个用户数据库。这之外还创建有应用程序（application）和提供程序（provider）。应用程序是程序的入口，记录了应用的名称、图标的信息；方便隔离各应用并设置其独立的权限。

大多数应用程序与提供程序一对一绑定，提供程序基于用户数据库与设定的规则（policy）一起提供登录鉴别和鉴权能力。

那么一个要接入的软件，我们会为他创建一个新的应用，根据软件支持的统一登录协议创建对应的提供程序。

> 下面配置的细节，基于 Authentik 2024.2.2，按英文界面按钮文字进行说明。

## 应用程序创建

使用管理员账号登录，进入后台 `Applications` > `Applications`，点击 Create 会弹出一个填写新应用参数的窗口。

![Authentik Application Creation Window](https://cdn.ecwuuuuu.com/blog/image/authentik/application-create.png)

常用功能填写的参数包括：

- 名称 Name：显示在页面上和授权页的应用名
- 短标签名 slug：一般只用小写英文字母和连接符 `-`，是在 URL 中使用的内部名称
- 组 Group: Authentik 的用户界面上，组同名的应用会显示在一起。
- 提供程序 Provider：指定与应用绑定的提供程序，如果还没有创建，或者该应用不使用同一登录，暂时不填。

用户界面设置中：

- 启动 URL （Launch URL）：在 Authentik 中点击应用会跳转的 URL，如果留空系统会尝试提取启动 URL。
  - 在新标签页打开（Open in new tab）：如名字所示
- 图标 Icon：在用户界面显示的应用图标，如果留空系统会按首字母生成一个占位图标。
- 发布者（Publisher）和描述（Description）：显示在用户界面的应用相关字段。

在应用创建的页面，官方也提供了一个创建向导，可以快速地同时创建应用和我们后面要提到的提供程序。创建好时，应用程序跟提供程序就已经被自动绑定了。

## 提供程序

提供程序的创建在后台 `Applications` > `Provider` 中。点击 `Create` 会弹出一个创建提供程序的向导。其中首先要选择的是提供程序的类型。

![Authentik Provider select](https://cdn.ecwuuuuu.com/blog/image/authentik/provider-select.png)

### OpenID Connect (OIDC) / OAuth 2.0

如果你要创建的是 OIDC 提供程序。选择类型之后，你能填入以下字段：

- 名称 Name：这个主要是用于指示不同的提供程序，我往往喜欢直接用：应用名 + Provider 这样的格式
- 身份验证流程 Authentication flow：这个是指示如果用户处于未登录状态，将会跳转至哪个身份验证流程。可以留空，系统会使用默认的登录流程。
- 授权流程 Authorization flow：系统提供了两种初始的 `default-provider-authorization-explicit-consent`，`default-provider-authorization-implicit-consent` 差异是 `explicit` 会在登陆时有一个确认窗问你是否授权信息提供给应用用于登录。

接下来的协议设置是 OIDC 协议专用的字段：

- 客户端类型 Client type：可选机密 Confidential 和公开 Public，这个主要是看接入的应用是否通过加密的方式处理了相关的身份信息。目前大多的应用都是支持加密的，所以一般都是选择机密。
- 客户端 ID 和 客户端 Secret：是创建 OIDC 提供程序时窗口系统会自动生成这两个字段。这个信息需要在配置客户端（接入应用）时填到应用里。
- 重定向 URI：用户通过 OIDC 完成了授权，接入应用会获得令牌并用令牌去获取登录用户的信息，获取的请求会告知统一登陆将用户信息重定向至哪里。Authentik 这里提供了一个确认的机制，以防中间人替换了用户信息重定向的端点。也可以写成正则表达式甚至是通配符来接受所有重定向 URI。
- 签名密钥 Signing Key：指定传递的信息使用什么密钥进行加密。有一部分应用的 OIDC 实现要求一定要进行签名，这时候就需要指定好。

以下举 Gitea 和 Grafana 的例子来说明如何配置。

#### Gitea

![Gitea OIDC Settings](https://cdn.ecwuuuuu.com/blog/image/authentik/gitea-oidc-setup.png)
