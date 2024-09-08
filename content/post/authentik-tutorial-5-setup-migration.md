---
title: Authentik 教程系列：服务的迁移
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/7b49gfsgQZY/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fHRyYW5zcG9ydHxlbnwwfHx8fDE3MjU4MDg5MzV8MA&force=true&w=2400
unsplashfeatureimage: xyzcharlize

publishDate: "2024-09-08T22:20:00+01:00"
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

confidence: likely
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
# extramaterials:


copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## 提醒

**因为迁移涉及数据的操作，操作前请提前做好研究，做好备份！！！**

## 引入和备份操作

这应该是 Authentik 系列的最后一部分，最近暂时没有时间录制视频所以先记录成文字。生产环境的 Authentik 的需要迁移，正好在几天折腾了一下，搞清楚了流程。

我们首先回顾一下 Authentik 的四个容器：

- Server
- Worker (和 Worker 是一个镜像，启动参数不同)
- Database (PostgreSQL)
- Redis

其中 Server 和 Worker 可以认为是无状态的，用户和应用的数据都存储在数据库中。Redis 中储存的是用户的 Session 和 Worker 待运行的任务（必要数据也会定时持久化）。可见这些数据中，只有 Database 容器的数据是需要备份的。

Server 和 Worker 还映射出了三个文件夹：

- media
- certs
- custom-templates

certs 的数据如果被服务发现后，会被存到数据库中，所以不需要备份。custom-templates 如果你之前制作了内容，则**需要备份**。media 里面存储的是上传的应用图标，背景图，**需要备份**。如果这个数据不备份，迁移后的服务会因为缺少文件而无法显示图标或背景。

### PostgreSQL 备份

> 居于官方数据升级迁移教程修改： https://docs.goauthentik.io/docs/troubleshooting/postgres/upgrade_docker

我们会使用 `docker compose exec` 来执行指令，所以在执行前需要进入 Authentik `docker-compose.yaml` 文件所在的目录。

1. 将数据库容器的 docker volume 做一个备份：

```bash
docker volume create authentik_database_backup
docker run --rm -v authentik_database:/from -v authentik_database_backup:/to alpine sh -c 'cd /from && cp -a . /to'
```

这里利用首先创建了一个叫 `authentik_database_backup` 的 docker volume；然后创建了一个 alpine 的容器并将旧 volume 和新建的 volume 都挂载进去，并执行复制的操作来实现了 volume 的备份。

2. 将数据库的内容使用 pg_dump 导出为 `sql` 文件。

`docker compose exec postgresql pg_dump -U authentik -d authentik -cC > authentik_db_backup.sql`

这个就是利用 postgresql 自带的 pg_dump 工具，将数据保存成 sql 文件。

### media 文件夹的备份

我这边直接使用 `zip` 指令对文件夹进行了打包(`zip -r media.zip media`)，然后再在目标机器进行了解压。

## 数据的数据恢复、重启容器

### 容器准备
经过前两个操作，数据也就备份好了，我们可以接着在新服务器进行容器的重建。首先可以在官网按照服务创建的操作，下载 `docker-compose.yaml`，并提前拉取需要的镜像。`.env` 直接复用旧服务器上的。

在启动前，需要给 `postgresql` 容器添加一个网络的配置，`network_mode: none`。

```yaml
  postgresql:
    image: docker.io/library/postgres:16-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}"]
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
    env_file:
      - .env
    network_mode: none
```

这样可以避免其他容器接到 postgresql，对数据库进行写入。方便我们进行备份。

修改后，我们就可以 `docker compose up -d` 来启动服务了。

### 数据库数据恢复

待数据库启动后，执行 `cat authentik_db_backup.sql | docker compose exec -T postgresql psql -U authentik`，待执行完毕，数据库里的数据就恢复了。

### media 文件夹恢复

文件夹的恢复只需要将文件放置到相应位置即可，解压后需要注意文件的归属和权限，使用 `sudo chown -R root:root media` 调整好文件权限。

### 恢复数据库网络配置

我们刚刚在 yaml 里面写的  `network_mode: none` 需要删掉，然后执行 `docker compose up -d --force-recreate` 来重建服务，网络配置恢复后，Server 和 Worker 也可以正常的访问数据库。配置好反向代理，新服务器上的 Authentik 服务也就启动了。

最后还需要检查 Outpost 有没有正常启动，可能需要自行手动启动。至此，Authentik 就已经迁移完了。

## 参考资料

- https://github.com/goauthentik/authentik/issues/8411
- https://docs.goauthentik.io/docs/troubleshooting/postgres/upgrade_docker
