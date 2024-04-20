---
title: Authentik 教程系列：反向代理的配置
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/D44kHt8Ex14/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8SWRlbnRpdHl8ZW58MHx8fHwxNzEyNTEwODc2fDI&force=true&w=2400
unsplashfeatureimage: Brett Jordan

publishDate: "2024-04-08T19:55:00+08:00"
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
- Tech
- Website
- Network
- Cloud

# type: file, link, image, and others
extramaterials:
- type: link
  name: Bilibili：Authentik 教程系列 2 - 为 Authentik 配置 Traefik 和 Nginx 反向代理
  url: https://www.bilibili.com/video/BV1VE42137Vi/

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

统一登录平台最重要的步骤就是将应用接入。Authentik 支持的接入协议相当丰富，包括 OIDC/OAuth2.0，SAML，SCIM，