---
title: 将博客的构建和部署迁移到 Cloudflare Workers
subtitle: 
author: Zhenghao Wu
description: 
featureimage: 
unsplashfeatureimage: 

publishDate: "2026-08-21T16:48:01+01:00"
lastmod: 
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: true
toc: false
math: false
gallery: false
showinfocard: true
enablecomment: false

series: Website Note

confidence: certain
importance: 5

tags:
- Continuous Integration
- Cloudflare Workers
- Hugo
- GitHub Actions
- Cloudflare
- GitHub

categories:
- Website

# type: file, link, image, and others
extramaterials:

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

今天，我完成了将站点的构建和部署流程从 [GitHub Actions](https://docs.github.com/en/actions) + [GitHub Pages](https://docs.github.com/en/pages) 迁移到 [Cloudflare Workers](https://workers.cloudflare.com/) 的工作。

我不能说我的动机是项目工程优化。更多是看到 [8 月 17 日 GitHub 大规模故障](https://github.blog/news-insights/company-news/the-august-17-outage-and-the-work-ahead/)的“后怕”，配合着前段时间 GitHub Actions 用完额度后的焦虑（为了完成多端编译和打包，烧完了 GitHub Pro 3000 分钟的额度。这是一个还没公开的 Writing Harness 项目，未来成熟时会介绍给大家）。在这个相对清闲的早晨，我决定开始迁移。

本文主要是记录迁移过程和一些决策的思路。

## 影响面

这不是第一次想着将网站迁移到 Cloudflare，但因为担心影响面太大而一直没有行动。上个月其实已经将网站的原生 WebP 静态资源迁移到 [Cloudflare R2](https://developers.cloudflare.com/r2/) 。其他非 WebP 资源，特别是还依赖 [七牛云 imageview2](https://developer.qiniu.com/dora/api/basic-processing-images-imageview2)动态转换的资源还是通过七牛。Cloudflare R2 迁移的体验比较顺畅，也给了我更多的信心。

梳理了一下影响面，我觉得有以下几点：

1. 站点本身，源文件不变，只要能在新流程中用 hugo 完成构建和部署，访问的内容不会有变化。
2. GitHub Pages 有一个对我很有用的特性：当 User Site 绑定自定义域名后，同一账号下未单独绑定域名的 Project Sites 会继承这个域名，（[来源](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages?apiVersion=2022-11-28&utm_source=chatgpt.com)）并通过 `domain/<repository>` 访问。如果完全移除 User Site 的自定义域名，这些项目页面的访问地址也会随之变化，因此逐个处理会带来不少额外工作。
3. 旧主页 Repository 不应继续提供和主站完全相同的内容，否则搜索引擎需要在两套 URL 之间进行 canonicalization，可能带来重复内容、索引和权重信号分散等 SEO 问题。
4. 旧主页 Repository 的 Discussions 应该继续保存，作为 Giscus 评论的存储。
5. Staging Page 之前已经是通过 Cloudflare Workers 配合 Draft 构建参数部署的，不需要迁移。

### 迁移决策

在梳理了影响面后，我决定采取以下迁移策略：

1. 主站 `ecwuuuuu.com` 的构建和部署迁移到 Cloudflare Workers，直接从 `ecwu.github.io.source` 项目的 `main` 分支构建和部署。
2. 旧主页 `ecwu.github.io` 的绑定域名迁移到 `page.ecwuuuuu.com`，继续使用 GitHub Actions 部署（纯静态文件，不涉及构建）。并保留 Discussions 评论和历史内容。内容和 CNAME 文件进行替换。
3. 其他 Repository 在 GitHub Pages更换了域名后，从原来的 `ecwuuuuu.com/<repository>` 访问方式迁移到 `page.ecwuuuuu.com/<repository>` 访问方式。
4. 重新配置 WWW 与 Apex 域名的 CNAME 记录，确保访问 `www.ecwuuuuu.com` 和 `ecwuuuuu.com` 都能访问到主站。
5. 站点内旧的指向 `ecwuuuuu.com/<repository>` 的链接，迁移到 `page.ecwuuuuu.com/<repository>`。

## 迁移过程

1. 主站

  我体验到的第一个优势是 Workers Builds 的构建镜像已经预装了 Hugo，因此不再需要像 GitHub Actions 中那样额外使用 `peaceiris/actions-hugo@v2` 配置 Hugo 环境。Cloudflare 也提供框架自动检测和项目配置能力；对于这个站点，我只需要在 `wrangler.toml` 中配置静态资源输出目录，并在 Workers Builds 中指定构建命令即可。

  这里配置的构建指令是：

  ```bash
  git submodule update --init --recursive && hugo --minify
  ```

  先更新 git submodule，然后执行 hugo 构建。构建完成后，Workers Builds 会继续执行部署命令；wrangler deploy 根据 wrangler.toml 中配置的静态资源目录，将 public/ 下的内容作为 Worker Static Assets 部署。
2. 旧主页

  我觉得绑定域名后，GitHub Pages 的自动 subpath 访问方式还是很方便的。绑定的域名更换为 `page.ecwuuuuu.com`，原来的 `ecwu.github.io` 项目则将 CNAME 文件替换为 `page.ecwuuuuu.com`，并设置单独的 index.html 文件作为首页。这样，页面完全是静态的，不需要构建。旧的 GitHub Actions 则去掉构建后将内容推送到 `ecwu.github.io` 项目的操作，避免内容被覆盖。
3. WWW 域名和 Apex 域名的 CNAME 记录配置

  之前 Apex 域名 `ecwuuuuu.com` 使用 A/AAAA 记录指向 GitHub Pages。迁移后，我直接将 ecwuuuuu.com 配置为 Worker 的 Custom Domain，由 Cloudflare 自动创建相应的 DNS 记录并管理证书。但这里有一个问题，之前 WWW 域名 `www.ecwuuuuu.com` 配置的 CNAME 记录指向 Apex 域名，但这个请求到 Cloudflare Workers 会因为没有匹配到 `www.ecwuuuuu.com` 的路由而返回 522 错误。

  这部分需要写 redirect 规则。具体做法是给 `www.ecwuuuuu.com` 配置一条开启 Proxy 的 A 记录，指向 `192.0.2.1`。这是 Cloudflare 官方针对“仅用于重定向、没有实际源站”的域名所推荐的占位地址；请求进入 Cloudflare 后即可由 Redirect Rules 处理。然后在 Rules 里配置一个 Redirect 规则，匹配条件写 `(http.host eq "www.ecwuuuuu.com")`，然后目标写 `concat("https://ecwuuuuu.com", http.request.uri.path)`，跳转形式写 301。这样就能将 `www.ecwuuuuu.com` 的请求重定向到 `ecwuuuuu.com`。
4. 站点内旧的指向 `ecwuuuuu.com/<repository>` 的链接迁移

  这个比较简单，我是让 AI 把我博客 post 里的内容筛选一遍，需要的替换成 `page.ecwuuuuu.com/<repository>` 的链接。
5. 完成迁移，检查各个功能

  至此，迁移工作基本完成。检查了站点的访问、构建和部署流程，确认一切正常。
