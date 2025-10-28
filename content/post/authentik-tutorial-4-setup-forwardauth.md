---
title: Authentik 教程系列：通过反向代理和 ForwardAuth 接入任何应用
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/rZCimlB7skw/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mjd8fGZvcndhcmR8ZW58MHx8fHwxNzE0NDg5NzIyfDA&force=true&w=2400
unsplashfeatureimage: Nick Night

publishDate: "2024-05-01T21:53:00+08:00"
lastmod: 
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
  name: Bilibili：Authentik 教程系列 9 - 配置 ForwardAuth 将任意应用加入统一登陆
  url: https://www.bilibili.com/video/BV1Mb421a7fF/

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## 简介

如果应用不支持统一登录，或者应用比较的简单没用用户系统。想要将它们纳入自己的统一登录体系是比较麻烦。这种情况下 Authentik 提供了一种配合反向代理的鉴权方法：Forward Authentication (没找到中文翻译，我觉得可以译作`转发验证`)。

![Traefik ForwardAuth Flowchart](https://geek-cookbook.funkypenguin.co.nz/images/traefik-forward-auth.png)

鉴权的过程用 Traefik 的流程图做一下讲解：你的请求在经过反向代理时，ForwardAuth 的中间件会向设定好的身份验证服务发请求。如果验证服务返回 `2XX` 的验证码，反向代理则任务验证通过，将内容展现出来，否则则会拒绝返回内容。

Authentik 则基于 OIDC 实现了这个身份验证服务，反向代理的请求过来后会跳转进行身份验证。验证的结果返回到反向代理并记录到 Header 和 Cookie 中。后续继续访问时则凭着有效的 Cookie 则可以以有效的 Session 保持授权状态。

## 部署细节

根据上面的简单介绍，可以看出这个授权结构需要三个组件：

- 部署好的应用：我们这里用一个没有用户系统的应用 [flame](https://hub.docker.com/r/pawelmalak/flame) 做演示。
- 配置好的反向代理：我们这里用的是 Traefik，但官方也支持 Nginx / Envoy / Caddy。
- 身份验证服务：Authentik。

这里需要注意的是因为我们需要将授权后得到的 Cookie 保存在浏览器，所以验证服务是需要和应用在有一个域名下的，要实现这需要部署 Authentik Proxy，并配置 Treafik 将特定子目录的请求导向这个 Proxy。而 Proxy 本身通过 API 与 Authentik server 通信。

```yaml
services:
  flame:
    image: pawelmalak/flame:latest
    container_name: flame
    volumes:
      - ./data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock # optional but required for Docker integration feature
    environment:
      - PASSWORD=flame_password
    labels:
      traefik.enable: true
      traefik.http.services.flame.loadbalancer.server.port: 5005
      traefik.http.routers.flame.service: flame
      traefik.http.routers.flame.rule: Host(`flame服务.的.域名`)
      traefik.http.routers.flame.entrypoints: web
      traefik.http.routers.flame-tls.service: flame
      traefik.http.routers.flame-tls.rule: Host(`flame服务.的.域名`)
      traefik.http.routers.flame-tls.priority: 10
      traefik.http.routers.flame-tls.entrypoints: websecure
      traefik.http.routers.flame-tls.tls.certresolver: cfresolver
      traefik.http.routers.flame-tls.middlewares: authentik@docker
    restart: unless-stopped
    networks:
      - traefik
  authentik-proxy:
    image: ghcr.io/goauthentik/proxy
    ports:
      - 9000:9000
      - 9444:9443
    networks:
      - traefik
      - authentik_authentik
    environment:
      AUTHENTIK_HOST: https://auth服务.的.域名/
      AUTHENTIK_INSECURE: "false"
      AUTHENTIK_TOKEN: 在 Authentik 后台 Outpost 可以获取到 API TOKEN
      AUTHENTIK_HOST_BROWSER: https://auth服务.的.域名 # 可以设定内外网不同的域名 
    labels:
      traefik.enable: true
      traefik.http.services.authentik-proxy.loadbalancer.server.port: 9000
      traefik.http.routers.authentik-proxy.service: authentik-proxy
      traefik.http.routers.authentik-proxy.rule: Host(`flame服务.的.域名`) && PathPrefix(`/outpost.goauthentik.io/`)
      traefik.http.routers.authentik-proxy.entrypoints: web
      traefik.http.routers.authentik-proxy-tls.service: authentik-proxy
      traefik.http.routers.authentik-proxy-tls.rule: Host(`flame服务.的.域名`) && PathPrefix(`/outpost.goauthentik.io/`)
      traefik.http.routers.authentik-proxy-tls.priority: 15
      traefik.http.routers.authentik-proxy-tls.entrypoints: websecure
      traefik.http.middlewares.authentik.forwardauth.address: http://authentik-proxy:9000/outpost.goauthentik.io/auth/traefik  # 这里写 Traefik 能访问到 Authentik Proxy 的网址。
      traefik.http.middlewares.authentik.forwardauth.trustForwardHeader: true
      traefik.http.middlewares.authentik.forwardauth.authResponseHeaders: X-authentik-username,X-authentik-groups,X-authentik-email,X-authentik-name,X-authentik-uid,X-authentik-jwt,X-authentik-meta-jwks,X-authentik-meta-outpost,X-authentik-meta-provider,X-authentik-meta-app,X-authentik-meta-version
networks:
  traefik:
    external: true
  authentik_authentik:
    external: true
```

其中需要讲解的几个点：

- `flame-tls.middlewares: authentik@docker` 里面特指的 `authentik@docker` 就是我们在 authentik-proxy 容器 labels 里面配置的 `middlewares.authentik.forwardauth` 中间件。
- 对于两个应用的 Host 我们设定了 `priority`，proxy 的优先级略高，这样如果发生了请求 URL 的冲突，会优先去做身份验证的请求。
- 我们的 Outpost 没有使用 docker 连接让 Authentik 自动拉起，而是通过手动启动并通过 API 去链接 Authentik 的方式，其中请求 API 需要用到的 Token 需要现在 Outpost 创建好才能获取。如果选择自动拉起的话配置会有不同，需要额外配置网络和 labels。
- 中间件配置 `authResponseHeaders` 的一长串可以直接去 Authentik [配置文档](https://docs.goauthentik.io/docs/providers/proxy/server_traefik)获取到，我没有做修改。

更多细节可以见视频（在文章最底部）演示。
