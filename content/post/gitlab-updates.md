---
title: 自建 GitLab 配置 SSH 和后续
subtitle: Quick Update
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/ZV_64LdGoao/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8NHx8Z2l0fGVufDB8fHx8MTY1MDY4NDUzNw&force=true&w=2400
unsplashfeatureimage: Pankaj Patel

publishDate: "2022-07-13T09:17:36+08:00"
lastmod: 
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: true
math: false
gallery: true
showinfocard: true
enablecomment: true

series: Website Note
previous:
next:

confidence: likely
importance: 8

tags:
- git
- self-host
- gitlab
- gitea
- nginx
- gitlab-ce
- baota
- cloud

categories:
- Home Lab

# type: file, link, image, and others
extramaterials:
- type: link
  name: ECGit
  url: https://git.ecwuuuuu.com
- type: link
  name: ECGit (Beta)
  url: https://git2.ecwuuuuu.com


copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

> 整体比较流水账，只做记录。

## 配置 SSH

部署了 GitLab 之后，一直在使用 HTTPS，体验不错。但是当时没有将 GitLab 的 SSH 访问成功配置。

当初的配置尝试过：1. 将 SSH 与服务器的 SSH 的端口共用。 2. 单独设置一个 SSH 端口并暴露出来。我的操作是直接在域名后面加端口号进行访问：`git.ecwuuuuu.com:<port>` 但进行 Git 操作都没有成功过。在排查 Log 发现是链接失败后，对域名执行了 nslookup，发现 IP 并不是预期的服务器 IP，这里是因为我使用了 Cloudflare 的解析服务，真实的 IP 被隐藏了。所以操作行不通。

于是我尝试直接通过原始的 IP 地址来进行 SSH 的操作，这次就直接成功了。

最后通过替换配置文件里的 `gitlab_rails['gitlab_ssh_host']` 字段，应用后，更新了页面上的 SSH 地址。

Cloudflare 是支持直接通过域名访问特定端口的，但因为安全原因，SSH 并不支持（[官方文章](https://blog.cloudflare.com/cloudflare-now-supporting-more-ports/#ftpsshandnonwebprotocols)）。所以对于 Git 使用 SSH 的需求，还是需要直接使用 IP 访问。

## 换回 Gitea

[上回提到](/post/self-host-gitlab-instance/)因为服务器性能过剩，自己将部署的 Gitea 换成了 GitLab。GitLab 确实“高大全”，功能相当的完善，但我也低估了这个巨无霸所需要的资源。部署之后，轻量虚拟机的内存占用长期在百分之 80% 以上，有时还会将整个服务器的服务卡死。我最近开始接触更多的玩意（比如使用 Authentik 做统一认证），再加上无法充分利用 GitLab 全部功能，最近还是决定换回 Gitea。目前两个 Git 都在运行，待 Gitea 配置完善，会进行切换并将 GitLab 关闭。