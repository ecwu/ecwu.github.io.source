---
title: Homelab：我的赛博积木 - 访问
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/ahi73ZN5P0Y/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjY1ODQ4NTQ2&force=true&w=2400
unsplashfeatureimage: Federico Beccari

publishDate: "2023-02-25T02:20:00+08:00"
lastmod: "2023-04-13T02:03:00+08:00"
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
- FRP
- Synology QuickConnect
- Tailscale


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

前面已经介绍了基础设施和已经部署的服务。对于部署在[公网的服务](/post/homelab-journey-internet/)，访问是方便的。在 Nginx 中通过反向代理将容器服务绑定在域名上，再配上 SSL 证书就可以实现安全方便的服务访问体验。真正让人头疼的是内网服务的访问和访问控制。

## 保证数据中枢 NAS 的可达

我之前就[尝试通过](/post/nas-ipv6-ddns/) IPv6 公网使得 NAS 上面的服务公网可达。作为自己的数据中枢，为了他的可达性。我用过这些方案：

- Synology QuickConnect
- FRP (Fast Reverse Proxy)
- IPv6
- Tailscale

### Synology QuickConnect

[Synology QuickConnect](https://kb.synology.cn/zh-cn/DSM/tutorial/What_are_the_differences_between_QuickConnect_and_DDNS) 是群晖 DSM 内带的远程访问工具，使用它访问 NAS 还会自动识别内外网环境，内网自动直连。他最大的优势是配置简单,你只需要在配置中开启该功能并设置 QuickConnect ID 就能直接使用。但有两个显著的缺点：1. 能访问的服务有限，只支持最基础的系统功能。2. 在中国大陆体验尚可，但就笔者 20-21 年在香港的体验来说，该服务绝大多数时间不可用。

### IPv6

通过 IPv6 访问 NAS 难度不算太高，一般光猫处配置 IPv6 透传再将防火墙打开即可。现在手机连接流量后大多时候都有 IPv6 访问，这样就可以使用 IPv6 地址或 DDNS 后的域名访问。我之前使用领势无线路由器桥接拨号，在深圳实习时通过 IPv6 稳定的远程串流 NAS 资源长达一个月，但这之后某一时点后就无法访问到了，需要重启家庭网络和设备才能回复，具体原因未查明。

后来更换光猫了不再进行桥接，无线路由仅作 AP 使用，IPv6 也稳定了很多，其他 IPv6 客户端请求内容可以将上行跑满，也不再有经历过访问中断的情况。但需要注意的时，使用容器部署的服务，服务需要使用 Host 网络才能通过 IPv6 + 端口号访问到，否则只能内网访问。


### FRP

FRP 是后来配置来作为 IPv6 访问补充的工具。最早知道 FRP 是还在大二，学校信息中心明确说明不能使用反向代理打通内外网。要实现 FRP 转发内网流量需要服务端 frps 和客户端 frpc 两个组件。两侧会建立起长连接来来保持通信，然后服务端会监听来自公网的请求。服务端接受外部请求且 frpc 可连通时，服务端会将 frpc 请求来源（client）的流量进行双向转发。转发在请求断开时就会结束。

简单来说它通过公网的中转机器实现内网流量的转发。本身 fprs 的部署也需要你有一台带公网的设备，但市面上有很多 fpr 服务提供商，很多还提供免费额度（比如我用过的 [SAKURA FRP](https://www.natfrp.com/)），这样只需要在需要反向代理的设备上部署 frpc 就可以实现内网的穿透。

最多的时候，我代理出了三个服务：DSM，EMBY 媒体服务，Apache Guacamole™ 远程桌面工具。但是国内的 frps 提供商说不上稳定，速度也差强人意。在免费使用了一年多，也尝试付费节点近半年的事件后，我最后放弃了 FRP 方案。

### Tailscale

Tailscale 是 [Lau](cklau.cc) 介绍的工具，他是基于 Wireguard 构建，力求易用。

- 它通过第三方服务的认证来登录，在设备上登录后就可以将设备添加进自己的组网里。然后 Tailscale 会自动处理用于加密点对点通信的密钥分发和配置。
- 大多时候，通信通过 NAT 穿透实现；但当穿透无法实现时，Tailscale 的中继服务会介入。

Tailscale 的效果非常惊艳，连接上就可以访问组网内的其他设备，不需要特别的配置，设备就如同在同一个内网。在 OpenWRT 连接并配置好相应的端口和防火墙后([一个教程](https://pfschina.org/wp/?p=9151))，网关下的设备能无需 Tailscale 客户端显式的连接，也访问到组网内的设备。

目前 Tailscale 已经成为了我的主要访问工具。但取决于你的网络环境，如果你所在的网络环境无法进行 NAT 穿透，Tailscale 无法直连并会使用一个中继服务器使用类似反向代理的方式进行连接。因为 Tailscale 的中继服务器不设在内地，这种情况下，访问速度会很慢，甚至时常无法访问到页面。对此可以自建 DERP 中继服务器，但是目前我还是尝试过，未来如果有机会我会继续补充。

## 门户 URL 自适应
群晖中使用 Docker 的服务相对是比较难管理的，各个服务都会用不同的端口号。再加上群晖虽然使用 Nginx 展示各种内容，但你无法方便的修改配置将主页映射到容器中（也就无法使用之前章节中介绍的 Flame 或者 Homarr）。

为此我使用了 Hugo 制作了一个门户页（使用 [Hugo-PaperMod](https://github.com/adityatelange/hugo-PaperMod/) 模板），来方便访问不同的服务。但是这个静态页面有些小问题，因为前面提到的访问方法很多，不同情况下，我的访问用的 URL 都是不一样的，正常 HTML 并无法自适应。但群晖的 DSM 中却有这一特性，即会根据你访问的 URL 来动态的调整页面中提供的 URL。为了实现类似的功能，我修改了 Hugo 模板的一些代码，加入了一段 JavaScript 来动态的修改按钮的 URL。

![NAS 上用 Hugo 生成的页面](http://cdn.ecwuuuuu.com/blog/image/homelab/nas-80-hugo-home.png)

```Javascript
let getUrl = window.location;
let baseUrl = getUrl.protocol+"//"+getUrl.hostname;
let btns = document.getElementsByClassName("dynamic-url");

for(let i=0; i < btns.length; i++){
  btn_url = new URL(btns.item(i).href);
  btns.item(i).setAttribute("href", baseUrl + ":" + btn_url.port + "/");
}
```

> 这段代码的意思是，首先拿到当前访问的网址做处理，提取出协议和 Hostname 组成 BaseURL。然后循环对页面中所有按钮的 URL处理：将 Hostname 部分修改成 BaseURL（可以认为是替换，但实际的做法是将端口号提取出来，然后和 BaseURL 组装出新的 URL）。其中 Anchor 按钮都会带有 `dynamic-url` class，方便使用 `getElementsByClassName` 提取出来，批量替换。

## 本地服务域名访问 + 配置 SSL 证书

部署了太多的服务，就比较难管理，除了用门户/开源的导航页的方案，还有一种方法是设定多个有意义的域名，然后将域名的请求指向特定的服务。这样不需要记 Port Number，也可以访问想要的服务。这背后基于反向代理基于。这里将所有的域名都解析到本地设备的 IP（可以使用 Cloudflare 的泛域名解析），并且本地设备的 80 和 443 端口已经被 Nginx / Caddy / Traefik 之类的 Web 服务端/代理工具托管。这样，你访问设置好的域名都会访问到对应的 IP，但是你访问使用的 Hostname 信息依然会随着请求头发送到服务端，服务端就是根据这个信息，来将请求转发到对应的服务中。

### Caddy 配置示例

```
portainer.local.ecwu.xyz {
  reverse_proxy https://portainer:9443 {
    transport http {
      tls_insecure_skip_verify
    }
  }
  tls /data/cert/local.ecwu.xyz.crt /data/cert/local.ecwu.xyz.key
}
```

上图的配置是我用于本地的 Portainer 服务做的配置，使用的是 Caddy 作为服务端。因为 Portainer 默认使用 HTTPS，且会生成自签证书，这样需要要求不校验 HTTPS 证书的有效性。然后再套用自定义证书（Let's Encrypt）。`/data/cert/local.ecwu.xyz.(crt/key)` 就是我存储 certificates 并映射进 Caddy 容器中的位置。

对于默认没有 HTTPS 的网址，配置更加简单，只需要定义 reverse_proxy 字段（需要注意，服务和 Caddy 在 Docker 中需要在同一网段，或者 IP 和端口在 Caddy 容器内可以访问到）。

### Let's Encrypt 针对用于局域网的域名申请证书

现在没有 HTTPS 证书的网站总是会带个不安全的提示，如果想避免这个情况，可以给自己的域名配置证书。但这个证书使用亚洲诚信来申请，他有一年的有效期，但是不支持泛域名证书，且申请有数量限制。Let's Encrypt 会存在一些小问题，他为了校验域名的所有，需要你在线存储特定信息的文件。但本地服务器是无法访问的，这个时候，你可以使用 DNS 校验的方式来验证。

```certbot certonly --manual  --preferred-challenges=dns-01```

你可以安装 certbot 来进行请求，使用上面显示的指令，他会接着询问你需要申请证书的邮箱和其他信息（如果域名曾经申请过，会进入续期的流程）。如果你需要申请泛域名，你需要注意带 wildcard：`*.local.ecwu.xyz`。

所谓的 DNS 校验会要求你在你的域名 TXT 解析中输入一些 Let's Encrypt 指定你设定的信息，你按他的要求添加（如果之前注册过，则是修改）后，再在 certbot 继续认证过程即可。这个过程一旦通过，证书就会被保存在申请设备的本地，你需要复制到指定位置并再 Web 服务端/代理 配置好，就可以实现自己本地服务带 SSL 证书的域名访问了。

## Cloudflare Zero Trust

最后的一个技术是使用 Cloudflare Zero Trust，这里我们先不讨论 Zero Trust 是什么概念。但是你可以使用它来限制你某个网站的访问。比如我的 ecwu.xyz 页面，我不希望其他人能看到里面的内容，那么我就可以使用 CloudFlare Zero Trust 来限制其他用户的访问：必须先经过鉴权。

我本身就使用 Cloudflare 进行网站的解析，并且已经部署了 Authentik 的身份验证服务。我将 Authentik 通过 OAuth2 的方式添加到 Authentication 的 Identity Provider 中。然后将 ecwu.xyz 页面加入到 Applications，并选定 Identity Provider 为 Login Method。经过这样的设定，ecwu.xyz 页面就要求登录才能访问了，并且正常情况下只显示一个登录页。

![CloudFlare Zero Trust 保护的 ecwu.xyz 网页](http://cdn.ecwuuuuu.com/blog/image/homelab/cf-access-ecwuxyz.png)