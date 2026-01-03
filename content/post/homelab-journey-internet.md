---
title: Homelab：我的赛博积木 - 公网服务
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/tjX_sniNzgQ/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjcyMjk2OTQ3&force=true&w=2400
unsplashfeatureimage: frank mckenna

publishDate: "2022-12-30T00:20:00+08:00"
lastmod: "2024-11-24T14:19:00+00:00"
draft: false
status: Finished
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
- Home Lab

# type: file, link, image, and others
extramaterials:
# - type: file
#   name: placeholder
#   url: #

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

与[内网服务](/post/homelab-journey-intranet/)不一样，部署在公网的服务目的性明确：希望能随时随地能访问到。这些服务部署在腾讯云轻量服务器，机房位于广州和香港。

## 身份鉴权 (SSO)：Authentik

> 涉及的服务：Authentik

部署在公网的服务，身份鉴权是很重要的一部分：有些资源、计算资源有必要授权后才可以访问。但如果各个系统的账号都分开控制，账号管理肯定非常麻烦。

但我们日常使用各家的平台时，会经常能看到“使用 Microsoft / Google 账号登陆”的选项，点击后会跳转到 Microsoft 或 Google 的页面，并询问你是否授权账号的部分信息（如昵称、邮箱）给平台以创建账号（或确认身份），最后成功登录。这种一个帐号通行的形式就是统一身份认证 SSO。如果能将这种形式复刻在自建的服务上，那一定会有很棒的体验。所以 HomeLab 公网服务部分首先介绍自建的身份鉴权平台 Authentik。

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/authentik-ui.png-compressed.webp"
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

> 我制作了 Authentik 系列教程，[点击了解更多](/post/authentik-tutorial-1-introduction-and-install/)

## 资讯获取

> 涉及的服务：miniflux，RSSHub。已淘汰方案：Tiny Tiny RSS

我对 RSS 并没有特别的情感，但是为了逃离推荐算法构建的茧房。用 RSS 这一工具，信息的来源从以往的被动接受转变为我主动选择。

### 阅读器：Miniflux

最初使用了 Tiny Tiny RSS (TTRSS) 的 [Docker 方案](https://ttrss.henry.wang/)，它插件、主题众多，有不少优秀的移动端 APP(第三方)，整体体验良好，使用了将近一年的时间。当 22 年 10 月份的时候，接触到 [Miniflux](https://miniflux.app/) 项目，它界面上更加简洁，而且是用 Go 实现的，应该会比用 PHP 实现的 TTRSS 更加的轻量，这些优势促使我切换了阅读器。

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/miniflux-ui.png-compressed.webp"
  class="class param"
  title="Miniflux"
  caption="简洁的 RSS 阅读器"
  label="flame-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

 ### 订阅生成：RSSHub

 除了阅读器，一起配套的服务是 RSSHub，这是一个 RSS 生成器，理论上可以为任意内容生成 RSS 订阅源；随着 RSS 式微，很多媒体/信息来源都不再提供 RSS 订阅的途径，而使用 RSSHub 就可以为这些途径生成一个可以订阅的链接，目前已经支持的信息源和可以从[官方文档](https://docs.rsshub.app/)中查看。但如果你不想自建，你也可以使用[官方部署的 Instance](https://rsshub.app/) 或是 [RSS Forever](https://rssforever.com/) 提供的 Instance。后者还附带了一些抓取要求的 API Key (比如 Twitter)，轻量需求下简单好用。

## 代码托管与持续构建

> 涉及的服务：Gitea, Drone

从 16 年开始使用 Git 之后，写代码几乎都会用利用 Git 进行版本控制。但很多半成品、学习新东西的产物并没有上传到 GitHub 上，而更多的是去了自建的 Git。

### 代码托管：Gitea

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/gitea-ui.png-compressed.webp"
  class="class param"
  title="自建 Gitea"
  caption="界面上挺像 GitHub"
  label="gitea-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

至于用什么自建 Git，现在已经有非常多的选择，GitLab/Gitea/Gogs 比较主流也各有优劣。我之前尝试过 GitLab（见 [自建 GitLab 踩坑实录](/post/self-host-gitlab-instance/) 和 [自建 GitLab 配置 SSH 和后续](/post/gitlab-updates/)）。最新是部署了 Gitea ，因为它功能齐全的情况下，比较的轻量。

### 持续构建平台：Drone

以前一直有听说 GitOps 中的 CI/CD (Continuous Integration and Continuous Delivery/Continuous Deployment 持续集成和持续构建)，但一直没有实践过。但完成将博客和 [HCC 的主页](https://uichcc.com) 利用 GitHub Actions 进行自动构建的改造后，开始体验到它的魔力。自己构建的 CI 是利用了 [Drone](https://www.drone.io/)，如果你使用的是 Gitea，官方提供了[安装教程](https://docs.drone.io/server/provider/gitea/)。我目前使用持续构建主要是进行 Docusaurus 的构建和一些软件的 Docker 镜像构建。CD 部分，因为架构上还没有用到 Kubernetes，加上 Portainer 的 Web Hook 功能需要付费，所以暂时还没有涉足。

> 2024.11 Update
>
> Gitea 在 1.21 版本后支持了自己的持续构建 Gitea Actions 的支持（从 1.19 开始可以手动启用）。如果不想额外部署 Drone，可以考虑使用 Gitea Actions。它使用的语法和 GitHub Actions 类似，学习和迁移成本较低。


## 密码管理：VaultWarden

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/vaultwarden-ui.png-compressed.webp"
  class="class param"
  title="vaultwarden"
  caption="BitWarden 密码管理器，但是是自建的（截图中还是老版本的 VaultWarden，新版本已经将 BitWarden 和 VaultWarden 更彻底的区分开，以避免版权商标带来的问题）"
  label="vaultwarden-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

[VaultWarden](https://github.com/dani-garcia/vaultwarden) 是 [BitWarden](https://bitwarden.com/) 密码管理工具的开源实现，支持 Bitwarden 官方的客户端，但与 Bitwarden 的公司无关。使用 Rust 实现。我本身在使用 BitWarden 的[付费服务](https://bitwarden.com/pricing/)。自己部署额外部署有两个原因：提供一个备份的访问渠道；为特定环境下的密码管理需求提供便利。

值得一提是，这个服务端几乎包含了付费端全部的功能。像密码泄露检查、Yubico MFA 等功能，你如果有相应功能提供商的 API，你也可以在自己的 VaultWarden 上体验和 BitWarden 一样的功能。

## 知识库/团队工具

> 涉及的服务：Outline, YouTrack

### 个人或团队知识库：Outline

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/outline-ui.png-compressed.webp"
  class="class param"
  title="Outline"
  caption="知识库，开源的 Notion 替代，可以自建"
  label="outline-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

我一直很热衷于尝试团队协作/知识库工具。研究生期间在使用 [Notion](https://www.notion.so/) 作为日常使用的笔记工具，后来为了内容的可迁移性更换到了基于 Markdown 的 [Obsidian](https://obsidian.md/)。但 Obsidian 还是更偏向于个人知识库，不太适用于团队使用。出于这样的需求，我 22 年中就开始物色新的知识库工具。最后 [Outline](https://github.com/outline/outline) 从众多知识库中脱颖而出，成为了一直用到现在的选择。它支持多人协同编辑（如石墨/腾讯文档/Confluence），但又使用了类似 Notion 的模块 （Block） 的设计。

它的用户系统在设计上比较激进，它必须配置统一登录或配置邮件发送以发送一次性登录链接（不支持账号密码登录）。但是它支持的 SSO 服务很多，具体见官方的[配置文档](https://wiki.generaloutline.com/s/hosting/doc/authentication-7ViKRmRY5o)。

需要注意的是，目前最新的版本 `0.66.3` 还不支持数学公式（LaTeX），但是[相关的功能已经合并进主线](https://github.com/outline/outline/issues/1038)，相信很快会在下一个发布版本中推出（2024.11 Update：LaTeX 已经在 [v0.67.1](https://github.com/outline/outline/releases/tag/v0.67.1) 之后版本支持）。

### 团队协作工具：YouTrack

  {{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/youtrack-ui.png-compressed.webp"
  class="class param"
  title="YouTrack"
  caption="官方演示项目"
  label="youtrack-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

[YouTrack](https://hub.docker.com/r/jetbrains/youtrack/) 部署来只是为了体验功能，它来自 IntelliJ IDEA 的公司 JetBrains，十个用户以内支持免费自部署。因为没有团队开发软件的需求，我并没有深度体验过，只作为一个灵活很高的看板和信息记录工具，属于是有点小题大做了。

## 辅助工具

> 涉及的服务：Flame，Uptime Kuma，Grafana

### 简易导航栏：Flame

目前内外网提到的服务就有十几种，如果使用的是端口，那很难全部记住（就算全用域名也容易搞混）。那么一个类似 Hao123 的门户导航站是有必要的。之前在内网，我使用的是 [Homarr](/post/homelab-journey-intranet#服务门户homarr)，但 Homarr 没有鉴权、可以随意修改页面的内容。这种形式是不适合部署在公网的。这种情况下，我就选用了 [Flame](https://github.com/pawelmalak/flame)。

{{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/flame-ui.png-compressed.webp"
  class="class param"
  title=""
  caption="简洁的自建开始界面"
  label="flame-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

 Flame 有 Application 和 Bookmark 的概念，显示上，Application会显示在页面的上半部分，且显示尺寸比较大。Bookmarks 显示在页面下半部分，可以归类。两种类似都可以设定名字和一个 [MDI](https://materialdesignicons.com/) 图标。每个链接都可以设定为私有或公开。设定管理员密码，只有输入密码后，才可以修改页面上的内容并查看私有链接。

 页面上还有附加功能，可以直接进行搜索和显示当地天气，很适合做内网的主页。

> 2024.11 Update
>
> 我现在已经转向使用另一个项目 [Homepage](https://github.com/gethomepage/homepage)。这个项目不提供前端的编辑，而是需要编辑配置文件（文件修改后页面会自动刷新和应用修改）。他的一个特性是内带了许多插件，这些插件经过配置后会通过访问 API 来获取数据，比如 PVE 的占用，下载器的下载速度，和媒体库的播放状态等。

### 服务状态监控：Uptime Kuma

各大互联网公司提供的服务状态页，使用 [Uptime Kuma](https://github.com/louislam/uptime-kuma) 你也可以获得同款。Uptime Kuma 部署后，可以定期（默认 60 秒）的帮你检查你监控的网页（也允许监控 TCP，UDP），并提供一个状态页进行展示。在服务出现故障时，它还能通过提醒服务告知你（比如 Telegram Bot）。

但除了自建，还有一种“滥用” GitHub 的方式实现服务的状态监控，通过 [upptime/upptime](https://github.com/upptime/upptime) 项目，利用 GitHub Actions 定期检查服务状态，用 GitHub Repository 储存历史信息，用 GitHub Pages 来展示状态页，是无成本的一种监控服务状态的方式。但需要注意的是，因为 GitHub Actions 的因素，服务并无法保证准确的一个固定的监控时间间隔，也就是说服务无法访问时，可能无法第一时间感知（但是个人用，也完全是够了）。

 {{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/uptime-kuma-ui.png-compressed.webp"
  class="class param"
  title=""
  caption="服务状态页"
  label="uptime-kuma-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

 ### 万能的数据可视化面板：Grafana

 这个服务使用的并不多，但是部署了还是可以提一下。Grafana 主要是用于数据的可视化并允许你方便的制作出一个可视化的面板。使用时它连接数据源（可以是传统基于 SQL 的，也可以是时间序列数据库如 [Prometheus](https://prometheus.io/)）然后面板中编辑数据的检索语句（Query），然后利用它自带（比如折线图、散点图、文本、列表）或是第三方的插件进行可视化。通过这种方式，可以很方便的生成出一个美观的可视化大屏。

  {{< figure
  src="//cdn.ecwuuuuu.com/blog/image/homelab/grafana-ui.png-compressed.webp"
  class="class param"
  title="Grafana"
  caption="可视化服务器 Docker 带宽和资源使用的状态"
  label="grafana-ui"
  attr=""
  attrlink=""
  alt="alt"
  link=""
 >}}

 个人使用方面，会将将服务器的状态接口让 Prometheus 抓取，然后使用 Grafana 可视化出来，实时监控服务器的负载和各资源的状态。
