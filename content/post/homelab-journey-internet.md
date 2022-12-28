---
title: Homelab：我的赛博积木 - 公网服务
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/pCR-OaboiZM/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8MjB8fHN0b3JhZ2V8ZW58MHx8fHwxNjY1ODIwNjI0&force=true&w=2400
unsplashfeatureimage: Jake Nebov

publishDate: "2022-10-15T12:07:00+08:00"
lastmod: 
draft: true
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

与内网服务不一样，部署在公网的服务目的性明确，希望能随时随地能访问到。这些设施部署在腾讯云的轻量服务器上，机房位于广州和香港。

## 资讯获取

> 涉及的服务：miniflux，RSSHub。舍去方案：Tiny Tiny RSS

我对 RSS 并没有特别的情感，但是为了逃离推荐算法构建的茧房。用 RSS 这一工具，信息的来源从以往的被动接受转变为我主动选择。

最初使用了 TinyTinyRSS(TTRSS) 的方案，它插件、主题众多，也有不少优秀的移动端 APP(第三方)，整体体验良好，使用了将近一年的时间。当 22 年 10 月份的时候，了解到 [Miniflux](https://miniflux.app/) 这一项目，界面上更加简洁，而且是用 Go 实现，应该会比用 PHP 实现的 TTRSS 更将的轻量，这些新特性促使我切换了阅读器。

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

## 身份鉴权 (SSO)

> 涉及的服务：Authentik

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

## 代码托管

> 涉及的服务：Gitea

见 [自建 GitLab 踩坑实录](/post/self-host-gitlab-instance/) 和 [自建 GitLab 配置 SSH 和后续](/post/gitlab-updates/)。

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
