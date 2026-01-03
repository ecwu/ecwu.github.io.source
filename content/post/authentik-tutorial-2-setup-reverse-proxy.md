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
- Tutorial

# type: file, link, image, and others
extramaterials:
- type: link
  name: Bilibili：Authentik 教程系列 2 - 为 Authentik 配置 Traefik 和 Nginx 反向代理
  url: https://www.bilibili.com/video/BV1VE42137Vi/

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

将服务进行反向代理，我们可以配置通过域名来访问 Authentik。因为 Authentik 实现上不会通过配置写死 URL，所以反向代理的配置非常方便。

根据官方的文档，如果要使用反向代理，以下 header 必须传给 upstream。
- `X-Forwarded-Proto`: 告诉 authentik 和代理提供商是否通过 HTTPS 连接提供服务。
- `X-Forwarded-For`: 让 authentik 知道客户端的 IP 地址。
- `Host`: 各种安全检查、WebSocket 握手以及 Outpost 和代理提供商通信所需。
- `Connection: Upgrade` 和 `Upgrade: WebSocket`: 需要升级 HTTP/1.1 下向 WebSocket 端点请求的协议。

我们目前假设已经部署了 nginx 和 traefik，下面只提供具体的配置。

## Nginx 

```nginx
# Upstream where your authentik server is hosted.
upstream authentik {
    server <authentik 服务器的 IP 或主机名>:9443;
    # Improve performance by keeping some connections alive.
    keepalive 10;
}

# Upgrade WebSocket if requested, otherwise use keepalive
map $http_upgrade $connection_upgrade_keepalive {
    default upgrade;
    ''      '';
}

server {
    # HTTP server config
    listen 80;
    listen [::]:80;
    server_name 你反代出来.的域名.com;
    # 301 redirect to HTTPS
    return 301 https://$host$request_uri;
}
server {
    # HTTPS server config
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 你反代出来.的域名.com;

    # TLS certificates
    ssl_certificate /etc/letsencrypt/live/domain.tld/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain.tld/privkey.pem;
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Proxy site
    location / {
        proxy_pass https://authentik;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade_keepalive;
    }
}
```

## Traefik

```yaml
---

services:
  postgresql:
    image: docker.io/library/postgres:12-alpine
    restart: unless-stopped
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}"
        ]
      start_period: 20s
      interval: 30s
      retries: 5
      timeout: 5s
    volumes:
      - database:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${PG_PASS:?database password required}
      POSTGRES_USER: ${PG_USER:-authentik}
      POSTGRES_DB: ${PG_DB:-authentik}
    networks:
      - authentik
    env_file:
      - .env
  redis:
    image: docker.io/library/redis:alpine
    command: --save 60 1 --loglevel warning
    restart: unless-stopped
    healthcheck:
      test: [ "CMD-SHELL", "redis-cli ping | grep PONG" ]
      start_period: 20s
      interval: 30s
      retries: 5
      timeout: 3s
    volumes:
      - redis:/data
    networks:
      - authentik
  server:
    image: ${AUTHENTIK_IMAGE:-ghcr.io/goauthentik/server}:${AUTHENTIK_TAG:-2024.2.2}
    restart: unless-stopped
    command: server
    environment:
      AUTHENTIK_REDIS__HOST: redis
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__USER: ${PG_USER:-authentik}
      AUTHENTIK_POSTGRESQL__NAME: ${PG_DB:-authentik}
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
    volumes:
      - ./media:/media
      - ./custom-templates:/templates
    env_file:
      - .env
    ports:
      - "${COMPOSE_PORT_HTTP:-9000}:9000"
      - "${COMPOSE_PORT_HTTPS:-9443}:9443"
    labels:
      - "traefik.docker.network=traefik"
      - "traefik.enable=true"
      - "traefik.http.services.authentik.loadbalancer.server.port=${COMPOSE_PORT_HTTP:-9000}"
      - "traefik.http.routers.authentik-http.service=authentik"
      - "traefik.http.routers.authentik-http.rule=Host(`你反代出来.的域名.com`)"
      - "traefik.http.routers.authentik-http.entrypoints=web"
      - "traefik.http.routers.authentik-tls.service=authentik"
      - "traefik.http.routers.authentik-tls.rule=Host(`你反代出来.的域名.com`)"
      - "traefik.http.routers.authentik-tls.entrypoints=websecure"
      - "traefik.http.routers.authentik-tls.tls=true"
      - "traefik.http.routers.authentik-tls.tls.certresolver=cfresolver" # 这个是我们提前配好的一个 certificatesResolvers
      - "traefik.http.middlewares.sslheader.headers.customrequestheaders.X-Forwarded-Proto=https"
    networks:
      - authentik
      - traefik
    depends_on:
      - postgresql
      - redis
  worker:
    image: ${AUTHENTIK_IMAGE:-ghcr.io/goauthentik/server}:${AUTHENTIK_TAG:-2024.2.2}
    restart: unless-stopped
    command: worker
    environment:
      AUTHENTIK_REDIS__HOST: redis
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__USER: ${PG_USER:-authentik}
      AUTHENTIK_POSTGRESQL__NAME: ${PG_DB:-authentik}
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
    # `user: root` and the docker socket volume are optional.
    # See more for the docker socket integration here:
    # https://goauthentik.io/docs/outposts/integrations/docker
    # Removing `user: root` also prevents the worker from fixing the permissions
    # on the mounted folders, so when removing this make sure the folders have the correct UID/GID
    # (1000:1000 by default)
    user: root
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./media:/media
      - ./certs:/certs
      - ./custom-templates:/templates
    env_file:
      - .env
    networks:
      - authentik
    depends_on:
      - postgresql
      - redis
volumes:
  database:
    driver: local
  redis:
    driver: local

networks:
  traefik:
    external: true
  authentik:
```

使用 traefik 需要确保 `traefik` 网络已经创建，且已经部署好的 traefik 容器也在这个网络下。

> 关于 traefik `certificatesResolvers` 如果配置请参考 https://www.reddit.com/r/Traefik/comments/18qf1ob/use_cloudflare_for_dns_challenge_for_local/
