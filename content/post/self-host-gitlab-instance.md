---
title: 自建 GitLab 踩坑实录
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/ZV_64LdGoao/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8NHx8Z2l0fGVufDB8fHx8MTY1MDY4NDUzNw&force=true&w=2400
unsplashfeatureimage: Pankaj Patel

publishDate: "2022-05-06T11:45:36+08:00"
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

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

之前自建了一个 Git 服务来托管自己的非公开代码。考虑要轻量，所以选择了 [Gitea](https://gitea.io/en-us/) 并通过 Docker + Nginx 的方式进行部署。

前段时间腾讯云免费提供了轻量服务器配置升级的活动，配置提升到了 4 核心 + 4G 内存。机器性能是一个过剩的状态，为了充分利用，所以我考虑将服务从 Gitea 换到 [GitLab](https://about.gitlab.com/install/)。这里把我的部署过程进行记录。

> Gitea 也提供了不错的体验，如果只需要一个轻量的 Git 服务，可以尝试。

## “巨无霸” GitLab
单从 Docker 库的大小来看，Gitea `1.16.6` 的[镜像](https://hub.docker.com/layers/gitea/gitea/1.16.6/images/sha256-01e0b118c1c9ebf16c0549d9bf3d12fe0eb31513a25e31007d0d08295e825e33?context=explore)大小为 102.05MB。而 GitLab `14.10.0-ce.0` 的[镜像](https://hub.docker.com/layers/gitlab/gitlab-ce/14.10.0-ce.0/images/sha256-1b0dcf05260c37986fc40022f6298be9f28b3a65e92ea10af94e14815eb272ca?context=explore)大小有 1.02GB。这十倍的差异直接体现在了 GitLab 庞大的功能。就像自建的 GitLab 首页的描述：

> **A complete DevOps platform**
> 
> GitLab is a single application for the entire software development lifecycle. From project planning and source code management to CI/CD, monitoring, and security.
>
> ...

安装好的 GitLab 就是一个完整的 DevOps（开发+运维）平台，包括了项目管理、源代码管理、持续构建和集成、监控和安全的功能。更具体的体现是，GitLab 除了支持其网站运行的服务，还集成了用于数据上报和监控的工具（Exporter + Prometheus + Grafana）。

GitLab 庞大的系统也注定了需要比较多的资源，特别是内存：要求至少 `2 核 4G 内存`，而 Gitea 只需要 `2 核 1G 内存`。GitLab 和 Gitea 官方都提供了横向对比，可以进一步了解。

- Gitea: [横向对比 Gitea 与其它 Git 托管工具](https://docs.gitea.io/zh-cn/comparison/)
- GitLab: [GitLab vs. Gitea](https://about.gitlab.cn/devops-tools/gitea-vs-gitlab/)

## 安装方法

GitLab 的官方文档属于很详细的类型，官方给出的安装方法有六七种，其中比较典型的是：

- 官方的软件包：Omnibus GitLab
- Docker Image 安装
- 安装在 Kubernetes （通过 Helm charts）
- 从源代码构建

我的服务器使用了宝塔面板，在内带的软件市场有 GitLab 的安装选择，本质上和官方的软件包安装一致。之前也尝试过使用 Docker 进行部署，但是 Nginx 的反向代理没成功，最后放弃了 Docker 的方案。

如果使用官方的软件包，只需要在[安装指南](https://about.gitlab.com/install)选择对应的的系统版本，会有很详细的逐步指南。以 CentOS 7为例，步骤为：

1. 启用 OpenSSH，防火墙添加 HTTP 和 HTTPS 服务
2. 安装 Postfix 用来发送邮件
3. 添加 GitLab 的软件包源
4. 配置环境变量来定义访问用的 URL
5. 等待安装完成
6. 安装完成后，获取自动生成的 root 用户密码，登录

## 进一步配置

> 这部分是这篇文章的重点内容，我在配置自己的 GitLab 时，重复安装了很多次，主要是无法通过自定义域名（不带端口号）访问域名。解决后复盘时会发现，一方面是自己比较心急，没有认真读文档；另外是网络上许多教程没有写的很清楚。

### 使用自定义域名访问（配置文件部分）

GitLab 的软件包中集成了 Nginx，安装后就可以通过 IP + 端口号的方式访问搭建好的 GitLab 实例（在云服务器上还有配置防火墙允许相应的端口）。但在自己试错的过程中，我尝试了：改配置中的URL、使用 Docker 安装再用 Docker 外的 Nginx 做反向代理，都没有成功。

最后使用的方案是关闭 GitLab 自带的 Nginx，然后利用宝塔的 Nginx 来处理请求。

1. 第一步是将 GitLab 的 Nginx 关闭：

```ruby
# from
nginx['enable'] = true
# to
nginx['enable'] = false
```

2. 设置 Nginx 用户
```ruby
# www is the user.
web_server['external_users'] = ['www']
```
如果不知道 Nginx 的用户，可以查看 Nginx 的配置文件 `nginx.conf`，用户会直接写在第一行（`user www www;` 则用户为 `www`）。如果不知道 nginx 配置文件的位置，可以用运行 `nginx -t` 查看。

3. 修改 `external_url` 到你的个人域名
```ruby
external_url 'http://git.yourdomain.com'
# type `https` if you want https SSL.
external_url 'https://git.yourdomain.com'
```
需要注意，如果要使用 https，url 中需要将 http 改为 https。

到这，你已经修改了 GitLab 的配置文件，运行 `gitlab-ctl reconfigure` 应用配置。

### 使用自定义域名访问（Nginx 配置部分）

官方其实已经提供了 [Nginx Vhost 的配置文件](https://gitlab.com/gitlab-org/gitlab-recipes/-/tree/master/web-server/nginx)，你只需要稍微的修改，就可以运用在自己的服务器上（有两个版本，根据是否启用 SSL 进行选择）。

我在配置时，为了能和宝塔的面板联动，所以进行了如下的修改。

0. 前提：在宝塔中创建好网站，解析已经配置

1. 在创建好的站点，进行配置：在`配置文件`选项卡，先粘贴覆盖官方提供的配置文件（以 SSL 版本为例）

2. 修改 server_name

在 38 行和 49 行的位置，将原配置中的 `YOUR_SERVER_FQDN` 换成你的域名，不需要带 http 或 https

3. 配置 SSL
- 将 55 行的 `ssl on;` 删去（在 Nginx 1.12 版本之后已经遗弃这一指令）
- 将 56-57 行的 `ssl_certificate` 进行修改。下面的位置与宝塔的 SSL 配置联动，在站点设置的 SSL 设置中，部署的证书会放置在下面列出的位置。如果不确定宝塔会放置证书的位置，在第 1 步覆盖前，可以先在原配置中找到（前提是站点已经配置并启用 SSL）
```
  ssl_certificate        /www/server/panel/vhost/cert/git.yourdomain.com/fullchain.pem;
  ssl_certificate_key    /www/server/panel/vhost/cert/git.yourdomain.com/privkey.pem;
```

4. 修改 log 的位置

在配置文件的 41-42 行、90-91 行，定义了日志的输出位置，根据自己的情况进行修改。
```
  access_log  /www/wwwlogs/git.yourdomain.com.log;
  error_log   /www/wwwlogs/git.yourdomain.com.error.log;
```

至此，使用自定义域名访问自建 GitLab 的配置已经完成，你应该应该可以通过域名访问自建的 GitLab 实例。

## 配置 Runner

虽然前面提到 GitLab 是完整的 DevOps 平台，但是要支持 CI/CD 等功能还需要进一步的配置。为了支持自动构建仓库，我尝试配置了一个 GitLab Runner。使用 Docker 进行安装和注册。官方对于 Docker 安装 Runner 已经给出了详细的教程（[安装](https://docs.gitlab.com/runner/install/docker.html)/[注册](https://docs.gitlab.com/runner/register/index.html#docker)）。

注册完就可以在管理后台的 Runner Tab 看到自建的 Runner 了。但是会发现项目还是无法使用 Runner 进行构建。排查后发现，虽然 Runner 是 Shared 的，但是还是只允许指定的项目，所以你需要在 Runner 的 `Restrict projects for this runner` 配置中，指定需要 CI 的项目。（这并不是一个治本的解决方案，需要待我继续熟悉下 GitLab）。

---

这就是目前我自建 GitLab 的情况，目前的使用已经达到我比较满意的状态。未来也会尝试配置配置其他功能。个人对于服务器运维方面开始小白，欢迎大家留言交流。
