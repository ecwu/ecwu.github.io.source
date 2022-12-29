---
title: Homelab：我的赛博积木 - 公网服务
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/tjX_sniNzgQ/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjcyMjk2OTQ3&force=true&w=2400
unsplashfeatureimage: frank mckenna

publishDate: "2022-12-30T00:20:00+08:00"
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

与[内网服务](/post/homelab-journey-intranet/)不一样，部署在公网的服务目的性明确：希望能随时随地能访问到。这些服务部署在腾讯云轻量服务器，机房位于广州和香港。

## 身份鉴权 (SSO)

> 涉及的服务：Authentik

部署在公网的服务，身份鉴权是很重要的一部分：有些资源、计算资源有必要授权后才可以访问。但如果各个系统的账号都分开控制，账号管理肯定非常麻烦。

但我们日常使用各家的平台时，会经常能看到“使用 Microsoft / Google 账号登陆”的选项，点击后会跳转到 Microsoft 或 Google 的页面，并询问你是否授权账号的部分信息（如昵称、邮箱）给平台以创建账号（或确认身份），最后成功登录。这种一个帐号通行的形式就是统一身份认证 SSO。如果能将这种形式复刻在自建的服务上，那一定会有很棒的体验。所以 HomeLab 公网服务部分首先介绍自建的身份鉴权平台 Authentik。

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/authentik-ui.png"
  class="class param"
  title="Authentik"
  caption="将所有支持 SSO 的服务都集中在一处，非 SSO 服务也可以添加进来，可以作为门户网站"
  label="flame-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

能自建的身份验证平台有许多，[Authentik](https://goauthentik.io/)，[Authelia](https://www.authelia.com/)，[Keycloak](https://www.keycloak.org/) 三者经常被拿出来比较。Keycloak 是红帽 (RedHat) 的开源项目，南科大 CRA 就在使用它做[统一登录服务](https://sso.cra.ac.cn/)，Authelia 我了解的比较少；而最后我选择 Authentik 是因为当初看到它开发者在 [Reddit 的讨论](https://www.reddit.com/r/selfhosted/comments/ub7dvb/comment/i6o9var/?utm_source=share&utm_medium=web2x&context=3)，开发者坦诚 Authentik 目前对比成熟的 Keycloak 显得比较稚嫩。但得考虑 Authentik 刚起步（2020 年初启动），项目处于活跃的开发阶段。对于我的需求，它的功能也够用。

> 最近还发现一个叫 [ZITADEL](https://zitadel.com/) 的项目，使用 Go 实现且界面看上去挺不错，如果你也在考虑部署统一登录，以上提到的四个方案都可以做考虑。

Authentik 支持 OIDC/OAuth2, SAML, LDAP, Proxy 四种 Provider，能覆盖目前绝大多数的统一认证需求：官方在[文档的 Integrations 部分](https://goauthentik.io/integrations/)收集了许多服务的配置方法指引。其他没有提到的服务，只要简单了解这几种 Provider 的原理，也能自行配置。

我觉得 Authentik 最可玩的是 Flows/Stages/Policies，基于这三个工具，可以创建流程，来实现邀请注册、多因素认证登录、邮箱验证等功能，但这部分比较复杂，未来会考虑单独写一篇文章介绍。

## 资讯获取

> 涉及的服务：miniflux，RSSHub。舍去方案：Tiny Tiny RSS

我对 RSS 并没有特别的情感，但是为了逃离推荐算法构建的茧房。用 RSS 这一工具，信息的来源从以往的被动接受转变为我主动选择。

最初使用了 Tiny Tiny RSS(TTRSS) 的 [Docker 方案](https://ttrss.henry.wang/)，它插件、主题众多，有不少优秀的移动端 APP(第三方)，整体体验良好，使用了将近一年的时间。当 22 年 10 月份的时候，接触到 [Miniflux](https://miniflux.app/) 项目，它界面上更加简洁，而且是用 Go 实现的，应该会比用 PHP 实现的 TTRSS 更加的轻量，这些优势促使我切换了阅读器。

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/miniflux-ui.png"
  class="class param"
  title="Miniflux"
  caption="简洁的 RSS 阅读器"
  label="flame-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

 ### RSSHub

 除了阅读器，一起配套的服务是 RSSHub，这是一个 RSS 生成器，理论上可以为任意内容生成 RSS 订阅源；随着 RSS 式微，很多媒体/信息来源都不再提供 RSS 订阅的途径，而使用 RSSHub 就可以为这些途径生成一个可以订阅的链接。但如果你不想自建，你也可以使用[官方部署的 Instance](https://rsshub.app/) 或是 [RSS Forever](https://rssforever.com/) 提供的 Instance。



## 代码托管

> 涉及的服务：Gitea

见 [自建 GitLab 踩坑实录](/post/self-host-gitlab-instance/) 和 [自建 GitLab 配置 SSH 和后续](/post/gitlab-updates/)。2022 年其实也写了一些小项目自娱自乐，学习了 Go 语言，但都只上传到了自建的 Gitea 上。

## 门户、辅助工具

> 涉及的服务：Flame，Uptime Kuma，Grafana

https://github.com/pawelmalak/flame

https://github.com/louislam/uptime-kuma

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/flame-ui.png"
  class="class param"
  title=""
  caption="简洁的自建开始界面"
  label="flame-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

 {{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/uptime-kuma-ui.png"
  class="class param"
  title=""
  caption="服务状态页"
  label="uptime-kuma-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

## 密码管理

> 涉及的服务：VaultWarden

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/vaultwarden-ui.png"
  class="class param"
  title="vaultwarden"
  caption="BitWarden 密码管理器，但是是自建的"
  label="vaultwarden-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

## 知识库，团队工具

> 涉及的服务：Outline, YouTrack

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/outline-ui.png"
  class="class param"
  title="Outline"
  caption="知识库，开源的 Notion 替代，可以自建"
  label="outline-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}
