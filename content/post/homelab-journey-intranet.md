---
title: Homelab：我的赛博积木 - 内网服务
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/8bghKxNU1j0/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8MTF8fHdpZml8ZW58MHx8fHwxNjY1MDg2OTQx&force=true&w=2400
unsplashfeatureimage: JJ Ying

publishDate: "2022-10-15T12:07:00+08:00"
lastmod: 
draft: false
status: In Progress
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: false
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

我的计算设施中，云服务器和本地设备各占一半，本地设备无公网 IPv4。这样的情况使得我的服务是分地部署、内外网隔离的（但不是做到严格隔离，这部分细节会在外网服务中提到。）

部署在内网的服务是为了服务自己进行内容的消费或生产。如文件的存取、媒体串流管理和矢量图、排版渲染引擎等。在本地的设备中也有详细分工：群晖的 NAS 部署要用到更多存储的服务。J4125 因为放在自己工作地的住处，则更多用于折腾，方便日常的生活。下面将按大类进行介绍。

## 半自动媒体中心

> 涉及的自建服务：Emby, Jellyfin, Jackett, Sonarr, Radarr, Chinesesubfinder, Flaresolverr, qBittorrent, Aria2
> 
> 部署区域：广州

大多人买 NAS 都会下载收藏电影和电视剧。刚买 918+ 使用的方案是使用群晖 DSM 带的 [Video Station](https://www.synology.com/en-global/dsm/feature/video_station)。这个工具的优势是自带基本的内容刮削（新版本需要申请一个 [The Movie Database](https://www.themoviedb.org/) 的 API 密钥），能通过官方的 Quick Connect 访问到。首次使用只需添加媒体目录的位置+等待内容索引后，就可以获得网页串流媒体文件的体验。

但 Video Station 的缺点也很明显：
- 刮削的搜索规则比较迷惑，对媒体的文件名要求比较高。如果不做人工干预，索引的媒体信息有许多错误。
- 对于额外资源的归档能力较弱，如动漫 ED/OP/OVA 或美剧的幕后，基本都会归档出错。
- 支持的媒体格式比较有限，DTS 视频和 EAC3 音频都无法播放（这个问题可以通过安装并配置 ffmpeg 来解决，可以参照这篇[博文](https://wp.gxnas.com/11491.html)）

所以许多人都会使用第三方的媒体管理工具。群晖官方的商店提供了 Emby 和 Plex，第三方还有 Jellyfin（这三个也都可以 Docker 部署）。这三个工具是被选择较多的媒体管理与串流工具。当初阅读了网上的一些介绍和比对的文章（[1](https://post.smzdm.com/p/awk8zn62/), [2](https://zhuanlan.zhihu.com/p/370799025)），最后选择了 Emby，主要是因为界面整洁美观。

单有媒体库还不够，我参照了 [sleele](https://sleele.com/) 的[《追剧全流程自动化》](https://sleele.com/2020/03/16/%e9%ab%98%e9%98%b6%e6%95%99%e7%a8%8b-%e8%bf%bd%e5%89%a7%e5%85%a8%e6%b5%81%e7%a8%8b%e8%87%aa%e5%8a%a8%e5%8c%96/) 一文，构建了集媒体资源监控、下载任务创建、媒体内容归档、字幕下载的半自动化追剧工具链。{{% sidenote "sn-no-media-install-details" %}}这里不对具体搭建的途径进行描述，可以直接参考 sleele 的文章，描述的非常详细。{{% /sidenote %}}总结来说，工具链的核心是 Sonarr 和 Radarr 这类剧集和电影媒体管理工具。它会爬取媒体的更新信息并定时任务检查缺失媒体，然后使用媒体索引工具 Jackett 来获取资源的下载链接，并将链接给到下载器执行下载任务。媒体文件下载后，会移动到指定的位置并按规范统一命名，等待对媒体库的索引。媒体库中的媒体信息，是由媒体库的刮削工具进行的。经过这些步骤，你提前选好的剧集就会第一时间被下载和整理到你的媒体库，等待你的观看了。

![Auto Media Base](//cdn.ecwuuuuu.com/blog/image/homelab/auto-media.drawio.png)

之所以是“半自动”，是因为自己的网络环境下，负责媒体资源监控的 Jackett 部分经常会出现网络相关的错误，导致媒体管理工具 Sonarr/Radarr 无法获取到对应的媒体资源并第一时间创建下载任务（通过 Aria2 和 qBittorrent）。所以目前使用的一个缓解是，在远端的服务器中部署了一个 Flaresolverr，用来绕过 Cloudflare 的认证。另外目前也在考虑将 Jackett 更换为 Prowlarr 项目（是 Jackett 索引管理器的一个替代品，目前处于快速迭代的状态）。半自动中不自动的部分，是 fallback 方案：手动下载媒体并放在预设位置，这样媒体库索引与刮削也能正常的工作，进行媒体的入库。

这套方案个人使用的还算满意，但是根据用户常看的剧集类型，媒体库做刮削的效果不一定好。比如一些港剧、国产剧，因为默认刮削来源 TMDB 缺乏信息，会刮削失败（可以增加豆瓣作为刮削的来源）；Jackett 上游失败，也会影响媒体获取的时效，因为 Sonarr 拿不到媒体的下载链接。自己这套系统中，动漫类资源的获取也可以改进，最近又了解到一个叫 [Auto_Bangumi](https://github.com/EstrellaXD/Auto_Bangumi) 的项目，可以做到番剧的整理下载，将来会考虑部署以提升系统体验。

## DSM 以外的文件 / 多媒体管理

> 涉及的服务：filebrowser, komga, paperless-ngx

### Filebrowser

自己现在是 iOS 设备和 Android 双持，macOS 与 Windows 兼修。再加上之前下定决心不在 macOS 上安装微信。因此想分享一个设备上的图片或文件，可能需要中转好几个设备和服务。

> macOS 要分享一个文件到微信里：macOS 上通过 OneDrive 传输到云端，安卓手机上用客户端下载下来，最后发送到微信里。（林檎牌设备可以使用 AirDrop，但曾经我还没拥有 iOS 手机）

基于这样的需求：内网传输文件、所有设备都可以访问。就开始考虑部署一个网页的文件浏览器。

以前自己玩云主机的时候，部署过 NextCloud (OwnCloud)。[NextCloud](https://nextcloud.com/) 功能丰富，撑得起团队办公的需求（安装插件可以处理多种文件格式，支持协作办公）。但在内网的场景，完全没必要部署这么“重”的方案（反正只允许内网访问，甚至不需求鉴权）。所以最后选择的是用 Go 写的文件浏览器，[filebrowser](https://github.com/filebrowser/filebrowser)。部署其 Docker 镜像，将目录映射到指定地点，就可以在 Web UI 进行文件的增删改查。支持多用户、运行脚本对文件进行操作、控制用户访问的目录范围等。

![Filebrowser](//cdn.ecwuuuuu.com/blog/image/homelab/filebrowser.png)

### Komga

自己不怎么看漫画，但还是有喜欢的作品{{% sidenote "sn-manga-work" %}}(《BLEACH》，《排球少年》){{% /sidenote %}}并收藏了电子化的漫画。这些大量图片的形式浏览不方便。所以想部署一个在线的漫画阅读器。一开始调研时，会发现电子书的阅读平台有很多，但是都不适合直接用于整理多图片的漫画。针对漫画有优化的工具有 Ubooquity，Komga，Kavita，Comixed。

最后选择了 Komga，因为 GitHub 上 Star 比较多，界面也比较的简洁。

![Komga](//cdn.ecwuuuuu.com/blog/image/homelab/komga-interface.png)

### Paperless-NGX

这个服务其实我也没有硬需求，只是想了解下就部署了（部署后，使用率也比较低）。之所以叫这个名字是因为最初的项目是 [Paperless](https://github.com/the-paperless-project/paperless)，原作者疲于维护，开源社区 Fork 出了一个新版本 [Paperless-ng](https://github.com/jonaswinkler/paperless-ng)，然后又因为缺少维护，有了现在最新的这个叉出 [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx)。

![Paperless-ngx](//cdn.ecwuuuuu.com/blog/image/homelab/paperless-ngx.png)

Paperless-ngx 的介绍是 scan, index and archive all your physical documents。也反映了他的用途：整理、电子化你的实体文件的。将你所有的实体文件扫描后导入，paperless-ngx 会进行 OCR 识别内容，配合你可以人工进行打标签、评论。整理好的文件再未来就可以很方便的进行检索查询。

Paperless-ngx 里的文档还有 Archive serial number 的概念，这在你需要保留原件时，可以生成 ASN 并标记到实体文件上，未来有整理实体文件额需求也会很方便。

如果你有大量的纸质文档并且想电子化，可以考虑部署一个使用。

## 辅助工具和其他

> 涉及的服务：portainer, dashdot, homarr, liberspeed

## 家庭体验提升

> 涉及的服务：pihole, home-assistant

## 排版渲染、矢量图绘图

> 涉及的服务：overleaf, drawio