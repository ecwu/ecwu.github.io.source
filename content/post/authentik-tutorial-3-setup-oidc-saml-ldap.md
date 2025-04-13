---
title: Authentik 教程系列：将应用通过 OIDC，SAML，LDAP 协议接入
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/AT5vuPoi8vc/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8aGFuZHNoYWtlfGVufDB8fHx8MTcxMzIwOTg2Mnww&force=true&w=2400
unsplashfeatureimage: charlesdeluvio

publishDate: "2024-04-21T14:29:00+08:00"
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
- SAML
- OIDC
- OpenID Connect


categories:
- Tech
- Website
- Network
- Cloud

# type: file, link, image, and others
extramaterials:
- type: link
  name: Bilibili：Authentik 教程系列 3 - 将应用接入统一登陆 - OAuth 协议篇 - 以 Gitea 和 Grafana 为例
  url: https://www.bilibili.com/video/BV1QC41157pX/
- type: link
  name: Bilibili：Authentik 教程系列 4 - 将应用接入统一登陆 - SAML 协议篇 - 以 Cloudflare Zero Trust 和 GitLab 为例
  url: https://www.bilibili.com/video/BV1um411B7kE/
- type: link
  name: Bilibili：Authentik 教程系列 5 - 将应用接入统一登陆 - LDAP 协议篇 - 以 EMBY 为例
  url: https://www.bilibili.com/video/BV12z421C7hU/

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

搭建了统一登录平台之后，最重要的事情就是将应用接入。Authentik 支持五种协议接入，分别是 [SAML 2.0](https://en.wikipedia.org/wiki/SAML_2.0)， [OAuth 2.0/OpenID Connect (OIDC)](https://openid.net/developers/how-connect-works/)， [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol)， [SCIM](https://scim.cloud)，和 [RADIUS](https://en.wikipedia.org/wiki/RADIUS)，其中 OIDC，SAML，和 LDAP 能覆盖我们大多数的接入需求。在这篇文章我将用具体应用示例的方式演示如何将应用接入 Authentik。

## Authentik 设计的架构（简化版）

我们先用一个很简化的模型来介绍我们会涉及到的几个概念。Authentik 内部维护有一个用户数据库。这之外还创建有应用程序（application）和提供程序（provider）。应用程序是程序的入口，记录了应用的名称、图标的信息；方便隔离各应用并设置其独立的权限。

大多数应用程序与提供程序一对一绑定，提供程序基于用户数据库与设定的规则（policy）一起提供登录鉴别和鉴权能力。

那么一个要接入的软件，我们会为他创建一个新的应用，根据软件支持的统一登录协议创建对应的提供程序。

> 下面配置的细节，基于 Authentik 2024.2.2，在内网的环境中进行的配置，按英文界面按钮文字进行说明。

## 应用程序创建

使用管理员账号登录，进入后台 `Applications` > `Applications`，点击 Create 会弹出一个填写新应用参数的窗口。

![Authentik Application Creation Window](https://cdn.ecwuuuuu.com/blog/image/authentik/application-create.png-compressed.webp "no-dark-invert")

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

![Authentik Provider select](https://cdn.ecwuuuuu.com/blog/image/authentik/provider-select.png-compressed.webp "no-dark-invert")

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

在 Authentik 里面都创建好之后，就可以在应用中做配置来进行接入了。一般接入的方式有两种，应用内创建认证源和启动时的配置。以下举 Gitea（创建认证源） 和 Grafana（启动时配置） 的例子来说明如何配置。

#### Gitea

![Gitea OIDC Settings](https://cdn.ecwuuuuu.com/blog/image/authentik/gitea-oidc-setup.png-compressed.webp "no-dark-invert")

[Gitea](https://github.com/go-gitea/gitea) 是一个轻量的版本控制平台。通过在启动的应用内创建认证源进行 OAuth2 的配置。入口是`管理后台` > `身份及认证` > `认证源`。

用户首先需要创建一个新的用户源类型选择 `OAuth2`，提供程序选择 `OpenID Connect`。`认证名称` 和 `图标 URL` 是可以自定的，会显示在登录页的登录按钮上。

和 Authentik 对应提供程序相关的字段有`客户端 ID`和`客户端密钥`，这个是签名创建提供程序时，Authentik 已经自动生成了的，只需要对应复制到 Gitea 中。

OpenID 配置一般还需要填写授权URL，令牌URL等信息告知应用程序，让授权时进行正确的跳转。Gitea 直接支持通过配置 URL 直接自动获取并解析。只需要进到 Authentik 的对应提供程序详情，就可以复制到 OpenID 配置 URL（格式是：`https://<AUTHENTIK URL>/application/o/<APPLICATION SLUG>/.well-known/openid-configuration`）。

最后还需要填写附加授权范围（Scopes）为：`email profile`。保存并启用这个认证源，那么配置就完成了。

#### Grafana

![Grafana OIDC Settings](https://cdn.ecwuuuuu.com/blog/image/authentik/grafana-oidc-setup.png-compressed.webp "no-dark-invert")

[Grafana](https://github.com/grafana/grafana) 是一个数据可视化的平台。它的 OAuth2 接入是通过启动时的环境变量进行配置。一下是启动的 docker-compose.yaml

```yaml
services:
  grafana:
    image: grafana/grafana-oss
    container_name: grafana
    restart: unless-stopped
    ports:
      - '3000:3000'
    extra_hosts:
      - "auth.demo.ecwu.xyz:192.168.31.6"
    environment:
      GF_SERVER_ROOT_URL: "http://192.168.31.6:3000"
      GF_AUTH_GENERIC_OAUTH_ENABLED: "true"
      GF_AUTH_GENERIC_OAUTH_NAME: "authentik"
      GF_AUTH_GENERIC_OAUTH_CLIENT_ID: "x4el5XrUcfTZbm1hEmBHRx8KlvsoWV2MDLvKEEyG"
      GF_AUTH_GENERIC_OAUTH_CLIENT_SECRET: "rXBIJdaCJXYX9D1DaCvw1oIFxhef22rv3CEgUHXohDafk3mX1aoZFzUfRBTZ4DtsJQ9BuTHlNy0Of15FiEg1oRlrFHls9lP2hKask6lLvdGJYSS6bPnrL1hFUFRxti2b"
      GF_AUTH_GENERIC_OAUTH_SCOPES: "openid profile email"
      GF_AUTH_GENERIC_OAUTH_AUTH_URL: "https://auth.demo.ecwu.xyz/application/o/authorize/"
      GF_AUTH_GENERIC_OAUTH_TOKEN_URL: "https://auth.demo.ecwu.xyz/application/o/token/"
      GF_AUTH_GENERIC_OAUTH_API_URL: "https://auth.demo.ecwu.xyz/application/o/userinfo/"
      GF_AUTH_SIGNOUT_REDIRECT_URL: "https://auth.demo.ecwu.xyz/application/o/grafana/end-session/"
      # Optionally enable auto-login (bypasses Grafana login screen)
      GF_AUTH_OAUTH_AUTO_LOGIN: "false"
      # Optionally map user groups to Grafana roles
      GF_AUTH_GENERIC_OAUTH_ROLE_ATTRIBUTE_PATH: "contains(groups, 'authentik Admins') && 'Admin' || 'Viewer'"
```

所有跟 OAuth 相关的配置都是以 `GF_AUTH_GENERIC_OAUTH` 开头的，可以看到和 Gitea 最大的区别就是，Grafana 并不支持 OpenID 配置 URL 自动获取配置。而是需要单独指定“授权”、“令牌”、“用户信息”和“登出” URL。

配置的时候有三个小细节需要注意：
1. 需要写 `GF_SERVER_ROOT_URL` 环境变量来指示 Grafana 的 URL ，因为 Grafana 在处理 OAuth 请求写入重定向端点时是通过 ROOT_URL 确定的，如果写不对则无法正常跳转完成鉴权。
2. 附加授权范围（Scopes）为：`openid profile email`
3. `GF_AUTH_GENERIC_OAUTH_ROLE_ATTRIBUTE_PATH` 是根据用户的组信息来动态的绑定新登录用户的权限，yaml的例子是，如果用户存在组 `authentik Admins` 内（Authentik 默认管理员组的名字），就会授予 Grafana 管理员权限，否则只是普通的浏览者（Viewer）的权限。 

### 创建新证书

有些应用要求 idP 对传输的信息进行签名，像一会要提到的 Cloudflare Zero Trust。Authentik 本身会默认创建有一张证书，你也可以直接选择来进行使用。但是我们这边介绍一下如何创建一张新的证书用于应用的签名。

首先进入证书创建的入口，`System` > `Certificates` 按钮有 `Create` 和 `Generate`，第一个是你已经在其他地方生成了需要导入到 Authentik。Generate 则是直接在线生成一张新的证书。一般点 `Generate` 即可。创建时可以选择有效时间，默认为 365 天。但如果过期了则需要进行更换，可以偷懒创建个 3650 天（10年）的 :P。

### SAML

如果在创建页选择了 SAML，你能看到以下字段：名称 Name，身份验证流程 Authentication flow，授权流程 Authorization flow 与 OIDC 是差不多的，根据需求设置即可。也有 SAML 特有的设置：

- ACS URL：Authentik 完成鉴权后重定向的地方
- Issuer/Entity ID：服务提供商的标识，如果应用程序可以设定则可以自定义并保持两边一致即可。如果不能自定则需要填写的与应用程序指示的一致。
- Service Provider Binding：Authentik 通过什么方式将信息发回到服务提供商。有 Redirect（Get 请求）或 Post 的方式。不同的应用支持不同，需要根据具体情况设定。
- Audience：一般与 Issuer 一致或者可以不设定。

SAML 一般要求对请求进行签名，你需要展开 Advanced protocol settings 进行更多设置：

- Signing Certificate 选择一张证书，可以是上面我们在创建新证书部分创建的证书。
- Verification Certificate 是应用那边返回的请求签名对应的证书。如果你能获取应用侧的证书则可以进行设定。否则留空。
- Property mappings 是决定那些信息将传递给应用。你可以全选。

其他设置可以保持不变。

#### Cloudflare Zero Trust

TBA

## Outposts

### LDAP 配置
