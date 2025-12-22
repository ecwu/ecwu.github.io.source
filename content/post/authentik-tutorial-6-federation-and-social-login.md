---
title: Authentik 教程系列：社交登录
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/r8evD-sX5Mc/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzY2MjY5MzM4fA&force=true&w=2400
unsplashfeatureimage:  Zulfugar Karimov

publishDate: "2025-12-21T22:19:29Z"
lastmod: "2025-12-22T21:10:51Z"
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
extramaterials:


copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

今天我们来讲讲**社交登录**（Social Login），也就是允许用户使用第三方账号（如 Google、GitHub、Facebook 等）登录到我们的 Authentik 系统中。随着教程的深入，要实现这些功能不再有简便的系统预设/流程可用，会涉及：
**Source 的概念，Flow 流程的详细配置，以及 Policy 策略的使用。**

之前我们都在使用 Authentik 来当各种服务的身份提供者（Identity Provider, IdP），但有时我们也希望 Authentik 能够作为一个**服务提供者**（Service Provider, SP），允许用户通过其他身份提供者登录。这就是社交登录的核心概念。

这些身份提供者被称为 Source (来源)，Authentik 通实现了多种协议，包括 OAuth2、OIDC 和 SAML。今天我们主要演示两个基于 OAuth 协议的提供者：GitHub 和飞书（Lark）。其中 GitHub 是官方支持的一种类型，而飞书则是通过自定义 OpenID OAuth Source 实现的。

## 概念解释

![Authentik 社交登录示意图](https://cdn.ecwuuuuu.com/blog/image/authentik-social-login-figure.png-compressed.webp)

传统的流程，Authentik 依赖内部的用户数据库（Built-in Source）来验证用户身份，作为 IdP 向各种应用提供认证服务（其他服务为服务提供商 SP）。而社交登录则是 Authentik 作为 SP，依赖外部的身份提供者（Source）作为 IdP来提供用户身份。

但这个过程，Authentik 并不是获取信息后转发到下游应用，而是将用户信息同步到 Authentik 的用户数据库中，通过 Enrollment 的流程将用户创建到 Authentik 系统中，然后用户就可以使用这些账号登录到 Authentik 绑定的各种应用中。

## GitHub 社交登录配置

### 创建 OAuth 应用

首先，我们需要创建一个 GitHub OAuth 应用，进入 GitHub 的开发者设置页面，Developer settings -> OAuth Apps -> [New OAuth App](https://github.com/settings/applications/new)。

填写应用信息：
- Application name: ECWU SSO
- Homepage URL: `https://auth.yourdomain.com` （替换为你的 Authentik 域名，但这个不是特别重要）
- Description: 可以不填
- Authorization callback URL: `https://authentik.company/source/oauth/callback/github` （替换为你的 Authentik 域名）

创建应用后，记下 Client ID 和 Client Secret（应用创建好后，Secret 需要新建）。

### 在 Authentik 中配置 GitHub Source

在 Authentik 管理界面，导航到 Directory -> Federation and Social login -> Create。

弹出的模态窗口中：

- Select Type 选择 GitHub OAuth Source。
- 第二页的信息中：
    - Name: Github OAuth (可自定义)
    - Slug: github (确保信息和大小写一致)
    - Protocol settings:
        - Client ID: 填入刚才 GitHub 应用的 Client ID
        - Client Secret: 填入刚才 GitHub 应用的 Client Secret

保存后，我们就创建好了一个 GitHub OAuth Source。

### 配置 Flow 流程

接下来，我们需要配置一个 Flow 流程来使用这个 Source。效果是用户在登录窗有一个 GitHub 登录按钮（图标），点击后跳转到 GitHub 授权页面。

在 Authentik 管理界面，导航到 Flows and Stages -> Flows，选择 default-authentication-flow 进行编辑。{{% sidenote "note-default-auth-flow" %}}这里要编辑的是系统绑定的默认认证流程，如果你有自定义的认证流程，可以选择编辑你自己的流程。检查系统具体使用的流程，可以在管理界面 -> System -> Brands -> authentik-default -> Default Flow -> Authentication Flow 查看。{{% /sidenote %}}

在 Flow 编辑页面，点击 Stage Bindings 选项卡，找到 default-authentication-identification 阶段，点击 Edit Stages。下拉找到 Source Settings，能在 Available Sources 中看到我们刚才创建的 GitHub OAuth Source，选中它添加到 Selected Sources 列表中，保存。(下面还有个Show sources' labels选项，可以勾选以显示文本标签)

然后我们还需要修改 default-source-enrollment Flows，在 Stage Bindings 选项卡中，找到 default-source-enrollment-write 阶段，找到 User Type。这里有三个选项：

- Internal：内部用户，可以登录到 Authentik 系统，自行管理账号（改密码，撤回对某个应用的授权等）。
- External：外部用户，只能登录到 Authentik 系统绑定的应用，不能登录到 Authentik 系统本身。
- Service account：服务账号，通常用于机器对机器的认证。

**这个 Flow 默认是选择 External，我们需要改成 Internal，否则用户登录后无法进入 Authentik 系统。（如果你希望用户只能登录到绑定的应用，而不能登录到 Authentik 系统本身，可以保持 External 不变。）**

保存后，我们就完成了 GitHub 社交登录的配置。现在用户在登录页面应该能看到 GitHub 的登录按钮，点击后会跳转到 GitHub 授权页面，授权后即可登录到 Authentik 系统。

## 飞书社交登录配置

第二个例子是飞书，Authentik 官方并没有直接支持飞书的 Source 类型（虽然有人提交了一个 PR），所以我们需要通过自定义 OpenID OAuth Source 来实现。而且飞书的 OAuth 实现有些特殊，需要注意一些配置细节。

{{< alert >}}
我们这里演示的是飞书国内版（feishu.cn），如果你使用的是国际版（lark.com），域名和 URL 有所不同，但我没有测试过国际版，具体配置请参考飞书的官方文档。
{{< /alert >}}

### 创建飞书应用

首先，我们需要在飞书开放平台创建一个应用，进入 [飞书开放平台](https://open.feishu.cn/)。登录后进入控制台，创建一个新应用（按要求名字和描述等信息）。

在应用创建好后，进入应用的开发配置 -> 权限管理，添加以下权限（搜索添加）：
- 获取用户邮箱信息 `contact:user.email:readonly`
- 获取用户 user ID `contact:user.employee_id:readonly`

然后在基础信息 -> 凭证与基础信息 中，记下 App ID 和 App Secret。

我们还需要配置`重定向 URL`：位置在开发配置 -> 安全设置，添加重定向 URL。需要注意的是，这个 URL 在 Authentik 创建好 Source 后能看到，格式是 `http://authentik.company/source/oauth/callback/{slug}/`，其中 `{slug}` 是你在 Authentik 创建 Source 时填写的 Slug。比如我们后面创建的 Source Slug 是 `feishu`，那么重定向 URL 就是 `http://authentik.company/source/oauth/callback/feishu/`。

创建好之后，记得去发布应用，让它生效。

### 在 Authentik 中配置飞书 Source

> 配置参考了 fangpsh's blog 的一篇文章，链接在参考资料部分。

在 Authentik 管理界面，导航到 Directory -> Federation and Social login -> Create。
弹出的模态窗口中：

- Select Type 选择 OpenID OAuth Source。
- 第二页的信息中：
    - Name: Feishu OAuth (可自定义)
    - Slug: feishu (确保信息和大小写一致)
    - Protocol settings:
        - Client ID: 填入刚才飞书应用的 App ID
        - Client Secret: 填入刚才飞书应用的 App Secret
        - Scopes: 填入 `* contact:user.email:readonly contact:user.employee_id:readonly`（最前面的 * 代表覆盖默认作用域）
    - URL settings:
        - Authorization URL: `https://accounts.feishu.cn/open-apis/authen/v1/authorize`
        - Access token URL: `https://open.feishu.cn/open-apis/authen/v2/oauth/token`
        - Profile URL: `https://passport.feishu.cn/suite/passport/oauth/userinfo`

保存后，我们就创建好了一个飞书 OAuth Source。

### 配置 Flow 流程

这部分和 GitHub 的配置类似，我们需要在 default-authentication-flow 中添加飞书 Source。具体步骤是一样的，这里不再赘述。

## 参考资料

- https://docs.goauthentik.io/users-sources/sources/social-logins/github/ （GitHub Source 官方教程）
- https://fangpsh.github.io/posts/2025/2025-07-24.html （飞书 OAuth2 配置参考，里面提供了几个关键的 URL）
- https://github.com/goauthentik/authentik/issues/8592 （一些关于 GitHub Source 的讨论）
- https://github.com/goauthentik/authentik/pull/13773 （飞书 Source PR）
- https://github.com/goauthentik/authentik/pull/18086 （微信 Source PR，已经合并到主线，预计很快能发布）