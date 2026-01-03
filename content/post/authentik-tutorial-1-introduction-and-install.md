---
title: Authentik 教程系列：简介和安装配置
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/D44kHt8Ex14/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8SWRlbnRpdHl8ZW58MHx8fHwxNzEyNTEwODc2fDI&force=true&w=2400
unsplashfeatureimage: Brett Jordan

publishDate: "2024-04-08T01:25:00+08:00"
lastmod: 
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
- Tutorial

# type: file, link, image, and others
extramaterials:
- type: link
  name: Bilibili：Authentik 教程系列 - 部署自己的开源身份验证服务 - 介绍、安装和配置 - OAuth2, SAML, LDAP
  url: https://www.bilibili.com/video/BV1pm41167WK/?spm_id_from=333.999.0.0

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

如果你也像我一样喜欢折腾 HomeLab，我们可能有个共同的乐趣就是寻找各种需求的自部署方案；但当我们这些自部署的服务越来越多，去访问每一个服务都需要单独的账号和密码；如果用户不止你一人，多账号管理也会成为一个麻烦的事情。

这样的情况下一种可行的方案是部署一个统一登录服务（SSO）。我们可以将部署的各种应用进行接入。那么当用户需要使用时，不再是在应用内进行登录，而是会被跳转到这个统一登录服务中，进行登录和鉴权。通过这个统一登陆服务，你就可以实现一个账号访问所有接入的应用。而且也可以很方便的去管理或者创建新的用户，去控制每一个用户具体的权限。在这之上也可以方便的对账号进行多因素身份认证的支持，比如说启用二步验证密码，或者使用 Yubikey 这样的加密硬件。

统一登录服务有很多，像我现在使用的就是 Authentik，鉴于现在网上关于 Authentik 的中文资料并不是很多，所以我开始制作这个教程希望通过这个系列将 Authentik 介绍给大家。并且根据一些具体的使用需求来展示如何去进行配置。

第一部分会先对 Authentik 做一个初步的介绍，具体讲解一下如何进行安装和配置。

## 什么是 Authentik

Authentik 这个名字来源应该是与它只有一个字母之差的 authentic (adj.) 意为是“真正的，真实的”。这个跟它身份验证的使用场景非常相关了。

从它的首页标语上可以看出它们的目标呢是替代像Azure (Active Directory) Okta 和 Auth0 这样的商用级的身份验证方案。作为一个身份认证提供商它的卖点是可以自部署而且开源的。对比使用谷歌登录和 GitHub 登录这种第三方服务。它认为你可以把一些很敏感的信息控制在自己的手上。

目前 Authentik 最新的版本呢是 2024.2.2，意思是 2024 年 2 月份发布的这个大版本里面的第三个版本。目前 Authentik 已经进入一个比较稳定的更新频率。

如果我们对比一下 Authentik 和它的竞品，官方也提供了一个这样的对比表格。Authentik 的优势是各种各样的身份验证协议支持的非常的全。其他家要么是不支持；要么呢是需要一些额外的插件和服务才能启用。这样可以看出 Authentik 并不是一个非常轻量的解决方案。但是
对于 HomeLab 的使用场景来说，Authentik 做到了高大全。这样我们无论部署怎样的应用， Authentik 大概率都有支持它的身份认证的协议。

## 安装

安装方面，官方是推荐使用 Docker Compose 进行安装。如果你的 HomeLab 环境，是使用的 Kubernetes 进行的容器编排，官方也提供了相应的文件。

我这边呢使用的是一台，Ubuntu 的虚拟机进行操作，已经安装了 Docker 和 Docker Compose。

1.让你去下载一个 Authentik 最新版本的 docker-compose 文件

```bash
wget https://goauthentik.io/docker-compose.yml
```

点开里面可以看到，启动这个服务需要多个容器：

- postgresql
- redis
- server (authentik)
- worker (authentik)

这里面大部分的参数呢，都已经提前帮你写好，或者是从环境变量中读取参数。如果你没有去设定这些数值，他会自动使用一些默认值

2. 那么接下来你需要做的是创建一个 `.env` 文件

`.env` 文件会存储 PostgreSQL 数据库的密码，以及 Authentik 的一个私钥。
我们这里面只需要执行文档中给的指令

```bash
echo "PG_PASS=$(openssl rand -base64 36)" >> .env
echo "AUTHENTIK_SECRET_KEY=$(openssl rand -base64 36)" >> .env
```

你也可以选择进行一个邮箱的配置，这样重置密码流程，系统会通过邮件的形式发送密码重置邮件。但是呢我们在这一篇中并不涉及，我们之后会具体去介绍。

实际上你已经可以，直接启动这个 Docker Compose 的命令，但是呢我会考虑增加两个参数：

- AUTHENTIK_TAG：定义了拉去哪个版本，比如目前的最新 2024.2.2
- AUTHENTIK_IMAGE：是定义了从哪里拉去镜像，方便换成镜像站。

> 官方这边使用的是从 GitHub Container repository 进行拉取的，可能速度就会很慢。

修改完 `.env`，就可以执行 `docker compose pull` 拉取镜像。

3. 当所有的镜像都已经拉取下来之后，我们就可以启动 `docker compose up -d` 来将这些容器都创建出来，接着教程告诉你可以直接去访问对应网址来进行管理员账号的初始化：

```url
http://<你服务器的 IP 或主机名>:9000/if/flow/initial-setup/
```

那我这边的话 `192.168.31.6` 就是我测试设备的 IP，9000呢是它 HTTP 的端口号。

如果你立马进行访问，可能会显示拒绝访问。我们这是可以通过 `docker ps` 检查下启动容器的状态，有可能容器还在启动过程中。你也可以通过 `docker compose logs -f` 来查看具体的打印日志。

我们等待一下直到他健康状态变成 healthy

> 做一些进一步的介绍：
> Authentik 实际上会启动一个 Server 跟一个 worker 的一个两个容器
> Server 的话呢一般是处理前端的界面，具体的业务流程；worker 一般是作为计划任务的这个执行者
> 它们之间呢并不会直接的进行沟通，而是通过连接，同一个 PostgreSQL 的数据库和 Redis 数据库来进行这个间接的信息交流

等服务启动好后，在进入刚刚的创建账号页面，就已经显示了一个窗口让你去初始化创建第一个管理员账号。它这个第一管理员账号默认为 akadmin

## 额外配置

创建好账户，进入到右上角这个管理员界面，在左侧栏有个系统 -> 设置，这个地方我建议把头像中的 gravatar 给删掉，只留initials。然后允许用户去修改他自己的昵称，但是不允许他修改电子邮箱和他的用户名。

然后呢我们就可以点击保存，这样设置是因为 gravatar 在国内访问有点慢，我之前测试过如果启用 Gravatar Authentik 整个服务的体验就很慢。

那么到目前为止我们就已经完成了 Authentik 的一个初步的搭建，创建好了管理员的账号密码

我们之后呢会介绍如何去管理用户，如何去创建新的应用，以及把你部署的服务接入到 Authentik 中。
