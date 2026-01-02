---
title: Authentik 教程系列：将应用通过 OIDC，SAML，LDAP 协议接入
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/AT5vuPoi8vc/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8aGFuZHNoYWtlfGVufDB8fHx8MTcxMzIwOTg2Mnww&force=true&w=2400
unsplashfeatureimage: charlesdeluvio

publishDate: "2024-04-21T14:29:00+08:00"
lastmod: "2026-01-02T22:00:00+08:00"
draft: false
status: In Progress
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
  name: Bilibili：Authentik 教程系列 3 - 将应用接入统一登陆 - OAuth 协议篇 - 以 Gitea 和 Grafana 为例
  url: https://www.bilibili.com/video/BV1QC41157pX/
- type: link
  name: Bilibili：Authentik 教程系列 4 - 将应用接入统一登陆 - SAML 协议篇 - 以 Cloudflare Zero Trust 和 GitLab 为例
  url: https://www.bilibili.com/video/BV1um411B7kE/
- type: link
  name: Bilibili：Authentik 教程系列 5 - 将应用接入统一登陆 - LDAP 协议篇 - 以 EMBY 为例
  url: https://www.bilibili.com/video/BV12z421C7hU/

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

搭建了统一登录平台之后，最重要的事情就是将应用接入。Authentik 支持五种协议接入，分别是 [SAML 2.0](https://en.wikipedia.org/wiki/SAML_2.0)， [OAuth 2.0/OpenID Connect (OIDC)](https://openid.net/developers/how-connect-works/)， [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol)， [SCIM](https://scim.cloud)，和 [RADIUS](https://en.wikipedia.org/wiki/RADIUS)，其中 OIDC，SAML，和 LDAP 能覆盖我们大多数的接入需求。在这篇文章我将用具体应用示例的方式演示如何将应用接入 Authentik。

## Authentik 设计的架构（简化版）

我们先用一个很简化的模型来介绍我们会涉及到的几个概念。Authentik 内部维护有一个用户数据库。这之外还创建有应用程序（application）和提供程序（provider）。应用程序是程序的入口，记录了应用的名称、图标的信息；方便隔离各应用并设置其独立的权限。

大多数应用程序与提供程序一对一绑定，提供程序基于用户数据库与设定的规则（policy）一起提供登录鉴别和鉴权能力。

那么一个要接入的软件，我们会为他创建一个新的应用，根据软件支持的统一登录协议创建对应的提供程序。

> 下面配置的细节，基于 Authentik 2024.2.2，在内网的环境中进行的配置，按英文界面按钮文字进行说明。

## 应用程序创建

使用管理员账号登录，进入后台 `Applications` > `Applications`，点击 Create 会弹出一个填写新应用参数的窗口。

![Authentik Application Creation Window](https://cdn.ecwuuuuu.com/blog/image/authentik/application-create.png-compressed.webp )

常用功能填写的参数包括：

- 名称 Name：显示在页面上和授权页的应用名
- 短标签名 slug：一般只用小写英文字母和连接符 `-`，是在 URL 中使用的内部名称
- 组 Group: Authentik 的用户界面上，组同名的应用会显示在一起。
- 提供程序 Provider：指定与应用绑定的提供程序，如果还没有创建，或者该应用不使用同一登录，暂时不填。

用户界面设置中：

- 启动 URL （Launch URL）：在 Authentik 中点击应用会跳转的 URL，如果留空系统会尝试提取启动 URL。
  - 在新标签页打开（Open in new tab）：如名字所示
- 图标 Icon：在用户界面显示的应用图标，如果留空系统会按首字母生成一个占位图标。
- 发布者（Publisher）和描述（Description）：显示在用户界面的应用相关字段。

在应用创建的页面，官方也提供了一个创建向导，可以快速地同时创建应用和我们后面要提到的提供程序。创建好时，应用程序跟提供程序就已经被自动绑定了。

## 提供程序

提供程序的创建在后台 `Applications` > `Provider` 中。点击 `Create` 会弹出一个创建提供程序的向导。其中首先要选择的是提供程序的类型。

![Authentik Provider select](https://cdn.ecwuuuuu.com/blog/image/authentik/provider-select.png-compressed.webp)

### OpenID Connect (OIDC) / OAuth 2.0

如果你要创建的是 OIDC 提供程序。选择类型之后，你能填入以下字段：

- 名称 Name：这个主要是用于指示不同的提供程序，我往往喜欢直接用：应用名 + Provider 这样的格式
- 身份验证流程 Authentication flow：这个是指示如果用户处于未登录状态，将会跳转至哪个身份验证流程。可以留空，系统会使用默认的登录流程。
- 授权流程 Authorization flow：系统提供了两种初始的 `default-provider-authorization-explicit-consent`，`default-provider-authorization-implicit-consent` 差异是 `explicit` 会在登陆时有一个确认窗问你是否授权信息提供给应用用于登录。

接下来的协议设置是 OIDC 协议专用的字段：

- 客户端类型 Client type：可选机密 Confidential 和公开 Public，这个主要是看接入的应用是否通过加密的方式处理了相关的身份信息。目前大多的应用都是支持加密的，所以一般都是选择机密。
- 客户端 ID 和 客户端 Secret：是创建 OIDC 提供程序时窗口系统会自动生成这两个字段。这个信息需要在配置客户端（接入应用）时填到应用里。
- 重定向 URI：用户通过 OIDC 完成了授权，接入应用会获得令牌并用令牌去获取登录用户的信息，获取的请求会告知统一登陆将用户信息重定向至哪里。Authentik 这里提供了一个确认的机制，以防中间人替换了用户信息重定向的端点。也可以写成正则表达式甚至是通配符来接受所有重定向 URI。
- 签名密钥 Signing Key：指定传递的信息使用什么密钥进行加密。有一部分应用的 OIDC 实现要求一定要进行签名，这时候就需要指定好。

在 Authentik 里面都创建好之后，就可以在应用中做配置来进行接入了。一般接入的方式有两种，应用内创建认证源和启动时的配置。以下举 Gitea（创建认证源） 和 Grafana（启动时配置） 的例子来说明如何配置。

#### Gitea

![Gitea OIDC Settings](https://cdn.ecwuuuuu.com/blog/image/authentik/gitea-oidc-setup.png-compressed.webp)

[Gitea](https://github.com/go-gitea/gitea) 是一个轻量的版本控制平台。通过在启动的应用内创建认证源进行 OAuth2 的配置。入口是`管理后台` > `身份及认证` > `认证源`。

用户首先需要创建一个新的用户源类型选择 `OAuth2`，提供程序选择 `OpenID Connect`。`认证名称` 和 `图标 URL` 是可以自定的，会显示在登录页的登录按钮上。

和 Authentik 对应提供程序相关的字段有`客户端 ID`和`客户端密钥`，这个是签名创建提供程序时，Authentik 已经自动生成了的，只需要对应复制到 Gitea 中。

OpenID 配置一般还需要填写授权URL，令牌URL等信息告知应用程序，让授权时进行正确的跳转。Gitea 直接支持通过配置 URL 直接自动获取并解析。只需要进到 Authentik 的对应提供程序详情，就可以复制到 OpenID 配置 URL（格式是：`https://<AUTHENTIK URL>/application/o/<APPLICATION SLUG>/.well-known/openid-configuration`）。

最后还需要填写附加授权范围（Scopes）为：`email profile`。保存并启用这个认证源，那么配置就完成了。

#### Grafana

![Grafana OIDC Settings](https://cdn.ecwuuuuu.com/blog/image/authentik/grafana-oidc-setup.png-compressed.webp)

[Grafana](https://github.com/grafana/grafana) 是一个数据可视化的平台。它的 OAuth2 接入是通过启动时的环境变量进行配置。一下是启动的 docker-compose.yaml

```yaml
services:
  grafana:
    image: grafana/grafana-oss
    container_name: grafana
    restart: unless-stopped
    ports:
      - '3000:3000'
    extra_hosts:
      - "auth.demo.ecwu.xyz:192.168.31.6"
    environment:
      GF_SERVER_ROOT_URL: "http://192.168.31.6:3000"
      GF_AUTH_GENERIC_OAUTH_ENABLED: "true"
      GF_AUTH_GENERIC_OAUTH_NAME: "authentik"
      GF_AUTH_GENERIC_OAUTH_CLIENT_ID: "x4el5XrUcfTZbm1hEmBHRx8KlvsoWV2MDLvKEEyG"
      GF_AUTH_GENERIC_OAUTH_CLIENT_SECRET: "rXBIJdaCJXYX9D1DaCvw1oIFxhef22rv3CEgUHXohDafk3mX1aoZFzUfRBTZ4DtsJQ9BuTHlNy0Of15FiEg1oRlrFHls9lP2hKask6lLvdGJYSS6bPnrL1hFUFRxti2b"
      GF_AUTH_GENERIC_OAUTH_SCOPES: "openid profile email"
      GF_AUTH_GENERIC_OAUTH_AUTH_URL: "https://auth.demo.ecwu.xyz/application/o/authorize/"
      GF_AUTH_GENERIC_OAUTH_TOKEN_URL: "https://auth.demo.ecwu.xyz/application/o/token/"
      GF_AUTH_GENERIC_OAUTH_API_URL: "https://auth.demo.ecwu.xyz/application/o/userinfo/"
      GF_AUTH_SIGNOUT_REDIRECT_URL: "https://auth.demo.ecwu.xyz/application/o/grafana/end-session/"
      # Optionally enable auto-login (bypasses Grafana login screen)
      GF_AUTH_OAUTH_AUTO_LOGIN: "false"
      # Optionally map user groups to Grafana roles
      GF_AUTH_GENERIC_OAUTH_ROLE_ATTRIBUTE_PATH: "contains(groups, 'authentik Admins') && 'Admin' || 'Viewer'"
```

所有跟 OAuth 相关的配置都是以 `GF_AUTH_GENERIC_OAUTH` 开头的，可以看到和 Gitea 最大的区别就是，Grafana 并不支持 OpenID 配置 URL 自动获取配置。而是需要单独指定“授权”、“令牌”、“用户信息”和“登出” URL。

配置的时候有三个小细节需要注意：
1. 需要写 `GF_SERVER_ROOT_URL` 环境变量来指示 Grafana 的 URL ，因为 Grafana 在处理 OAuth 请求写入重定向端点时是通过 ROOT_URL 确定的，如果写不对则无法正常跳转完成鉴权。
2. 附加授权范围（Scopes）为：`openid profile email`
3. `GF_AUTH_GENERIC_OAUTH_ROLE_ATTRIBUTE_PATH` 是根据用户的组信息来动态的绑定新登录用户的权限，yaml的例子是，如果用户存在组 `authentik Admins` 内（Authentik 默认管理员组的名字），就会授予 Grafana 管理员权限，否则只是普通的浏览者（Viewer）的权限。 

### 创建新证书

有些应用要求 idP 对传输的信息进行签名，像一会要提到的 Cloudflare Zero Trust。Authentik 本身会默认创建有一张证书，你也可以直接选择来进行使用。但是我们这边介绍一下如何创建一张新的证书用于应用的签名。

首先进入证书创建的入口，`System` > `Certificates` 按钮有 `Create` 和 `Generate`，第一个是你已经在其他地方生成了需要导入到 Authentik。Generate 则是直接在线生成一张新的证书。一般点 `Generate` 即可。创建时可以选择有效时间，默认为 365 天。但如果过期了则需要进行更换，可以偷懒创建个 3650 天（10年）的 :P。

### SAML

如果在创建页选择了 SAML，你能看到以下字段：名称 Name，身份验证流程 Authentication flow，授权流程 Authorization flow 与 OIDC 是差不多的，根据需求设置即可。也有 SAML 特有的设置：

- ACS URL：Authentik 完成鉴权后重定向的地方
- Issuer/Entity ID：服务提供商的标识，如果应用程序可以设定则可以自定义并保持两边一致即可。如果不能自定则需要填写的与应用程序指示的一致。
- Service Provider Binding：Authentik 通过什么方式将信息发回到服务提供商。有 Redirect（Get 请求）或 Post 的方式。不同的应用支持不同，需要根据具体情况设定。
- Audience：一般与 Issuer 一致或者可以不设定。

SAML 一般要求对请求进行签名，你需要展开 Advanced protocol settings 进行更多设置：

- Signing Certificate 选择一张证书，可以是上面我们在创建新证书部分创建的证书。
- Verification Certificate 是应用那边返回的请求签名对应的证书。如果你能获取应用侧的证书则可以进行设定。否则留空。
- Property mappings 是决定那些信息将传递给应用。你可以全选。

其他设置可以保持不变。

#### Cloudflare Zero Trust

[Cloudflare Zero Trust](https://www.cloudflare.com/zh-cn/zero-trust/) 是 Cloudflare 提供的零信任访问服务。它支持通过 SAML 协议接入第三方身份提供者。下面是配置的步骤：

1. 在 Authentik 中创建一个 SAML 应用和对应的 Provider。
   - 通过 “Create with Provider” 创建 SAML 应用和 Provider。应用名称按需填入。
   - 在 Provider 的配置页面，类型选择 “SAML Provider”。
   - 填写以下字段：
     - ACS URL: `https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/callback`
     - Issuer/Entity ID: `https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/callback`
     > INFO: `<your-team-name>` 替换为你的 Cloudflare 团队名称。ACS URL 和 Issuer/Entity ID 是一样的。
     - Service Provider Binding: 选择 `Post`
   - 展开 Advanced protocol settings：
     - Signing Certificate: 选择一张证书用于签名，选择后，勾选 Sign assertion 和 Sign responses。
     - Property mappings: 选择需要传递给 Cloudflare 的属性，一般全选即可
   - 保存 Provider 配置。
2. 在 Cloudflare Zero Trust 中配置 SAML 应用。
   - 登录 Cloudflare Zero Trust 仪表板，进入 `Integrations` > `Identity Providers` > `Add` > `SAML`。
   - 一个简单的方式是直接到 Authentik 的 SAML Provider 详情页，点击 `Metadata` 旁边的下载按钮，下载 SAML 元数据文件。
   - 在 Cloudflare 的 SAML 配置页面，选择 `Upload metadata file`，上传刚才下载的元数据文件。 Cloudflare 会读取并自动填充 SAML 设置字段。
   - 保存配置。
3. 创建好的 `Identity Provider`，可以直接点击 `Test` 按钮进行测试。如果配置正确，Cloudflare 会重定向到 Authentik 进行登录验证。登录成功后，Cloudflare 会接收到 SAML 响应并展示返回的用户信息。

## Outposts

Outposts 是 Authentik 的轻量部署单元（即可作为服务运行的组件），可以部署在任何可以访问 Authentik API 的位置。对于某些提供程序类型（例如 LDAP、Proxy、RADIUS、RAC），Outpost 是必需的：这些提供程序将主要逻辑在 Outpost 中执行以提高灵活性和性能。Outpost 使用自动生成的服务账号与令牌限制对 API 的访问权限，仅能读取配置的应用/提供程序及相关对象；当关联的应用或提供程序发生变更时，Authentik 会通过事件和 WebSocket 将新的配置推送到 Outpost，Outpost 也通过 WebSocket 上报健康状况。另一个优势是 Outpost 不依赖外网连接，适用于被防火墙或隔离网络保护的环境，以及对离线或隔离机器提供单点登录支持。

我们下面要介绍的 LDAP 就需要通过 Outpost 来实现。

### LDAP 配置

LDAP 准确来说并不是一个统一登录协议，而是一种目录服务协议。它不提供跨应用免登录能力，Authentik 会充当一个 LDAP 服务器的角色，应用程序通过 LDAP 协议去查询用户信息和验证用户密码。也就是用户在使用应用时，需要再次输入用户名和密码，应用程序通过 LDAP 协议将用户名和密码发送到 Authentik 进行验证。

相比之前介绍的 OIDC 和 SAML，LDAP 的配置会复杂一些。首先我们需要创建一个 Outpost 来提供 LDAP 服务。这涉及到创建一个专门的账户，和创建 LDAP Outposts。步骤如下：

#### 创建服务账号

1. 使用管理员账号登录后台，进入 `Directory` > `Users` > `Create` 创建一个新用户，示例中我们命名为 `ldapservice`。
2. 记下该用户的 DN（示例）：`cn=ldapservice,ou=users,dc=ldap,dc=goauthentik,dc=io`。

> INFO: 默认的 `default-authentication-flow` 会对 MFA 进行校验，而当前 LDAP 对 MFA 设备的支持有一定限制：除 SMS（短信）和 WebAuthn（通过 passkey）的设备外，其它常见设备均被支持。如果你只打算使用专用的服务账号来绑定 LDAP，或者不使用 SMS 验证器，则可以直接使用默认流程，跳过下面自定义流程的步骤并继续“创建 LDAP 应用与提供程序”。

#### LDAP Flow（自定义认证流程）

##### 创建自定义阶段

1. 进入 `Flows & Stages` > `Stages` > `Create`，创建一个识别阶段（Identification）：
   - 名称：`ldap-identification-stage`
   - 选择 User fields：`Username` 和 `Email`（如需，可加入 `UPN`）。
2. 同样在 Stages 中创建密码阶段（Password）：
   - 名称：`ldap-authentication-password`，保持 Backends 的默认设置即可。
3. 创建用户登录阶段（Login）：
   - 名称：`ldap-authentication-login`。

##### 创建自定义 Flow

1. 在 `Flows & Stages` > `Flows` > `Create` 新建一个认证流，名称：`ldap-authentication-flow`。
2. 打开该 Flow，选择 `Stage Bindings`：
   - 绑定 `ldap-identification-stage`，设置 order 为 `10`。
   - 绑定 `ldap-authentication-login`，设置 order 为 `30`。
3. 编辑 `ldap-identification-stage`，将其 Password stage 更改为 `ldap-authentication-password`。
4. `ldap-authentication-flow` 创建完成后，进入更新 flow 的设置页面，将 Authentication 从 `No requirement` 改为 `Require Outpost`。因为这个创建的 Flow 不包含 MFA 阶段，所以我们不希望它被用于普通的用户登录。上面这个设置可以确保只有 Outpost（LDAP）能使用该 Flow。

#### 创建 LDAP 应用与提供程序

1. 在 `Applications` > `Applications` > `Create With provider` 创建一个新的应用，命名为 `LDAP`，并在创建时选择 LDAP 提供程序。

#### 分配 LDAP 权限

1. 进入 `Applications` > `Providers`，打开刚才创建的 LDAP Provider，切换到 `Permissions` 标签页。
2. 点击 `Assign to new user`，选择 `ldapservice` 用户。
3. 选中 `Search full LDAP directory` 权限并点击 `Assign`，为该服务账号授予目录查询权限。

#### 创建 LDAP Outpost

1. 在 `Applications` > `Outposts` > `Create` 新建（或更新）一个 Outpost，`Type` 选择 `LDAP`，并将它关联到上面创建的 `LDAP` 应用。

> INFO: LDAP Outpost 会根据 Provider 的 Base DN 选择提供程序。为同一 Base DN 添加多个 Provider 可能会导致访问不一致，请避免重复的 Base DN。

2. Outpost 的创建依赖于 Docker 容器的运行，如果你配置了 Outpost Integration，Authentik 则会自动创建并启动容器。否则，你需要手动部署 Outpost。可以参考官方文档的 [LDAP Outpost 部署指南](https://docs.goauthentik.io/add-secure-apps/outposts/#outpost-integrations)。

#### 使用 ldapsearch 测试连通性

1. 在测试机器上安装 ldapsearch（Debian/Ubuntu 下）：

```bash
sudo apt-get install ldap-utils -y
```

2. 使用示例命令测试：

```bash
ldapsearch \
  -x \
  -H ldap://<LDAP_OUTPOST_IP>:389 \   # 生产环境请使用 ldaps:// 且对应的 SSL 端口
  -D 'cn=ldapservice,ou=users,DC=ldap,DC=goauthentik,DC=io' \
  -w '<ldapuserpassword>' \
  -b 'DC=ldap,DC=goauthentik,DC=io' \
  '(objectClass=user)'
```

> INFO: 成功的首次登录会在 `Events` > `Logs` 中记录，随后的重复登录通常由 Outpost 缓存，不再重复记录。

### Emby 配置

> 注意，Emby 上使用 LDAP 插件需要有效的 Premiere 授权。请确保你拥有授权许可后再试，否则将无法使用该功能。

安装好插件后，进入 `设置` > `插件` > `LDAP` 进行配置：

- LDAP server address: `<LDAP_OUTPOST_IP>`
- LDAP server Port number: `389`
- Bind DN: `cn=ldapservice,ou=users,DC=ldap,DC=goauthentik,DC=io`
- Bind credentials: `<ldapuserpassword>` 这里填写上面创建服务账号时设置的密码
- User search base: `DC=ldap,DC=goauthentik,DC=io`
User search filter: `(&(sAMAccountName={0})(memberOf=cn=media,ou=groups,dc=ldap,dc=goauthentik,dc=io))` 这里的 `media` 是我在 Authentik 创建的一个用户组，只有该组内的用户才能通过 LDAP 登录 Emby。

保存配置后，用户就可以通过 LDAP 账号登录 Emby 了。
