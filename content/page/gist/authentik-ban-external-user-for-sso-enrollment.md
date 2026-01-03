---
title: Authentik - 禁止外部用户进行 SSO 注册
subtitle: 
author: Zhenghao Wu
description: 
featureimage: 
unsplashfeatureimage: 

publishDate: "2025-12-24T18:00:00+00:00"
lastmod: 
draft: false
status: 
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: true
toc: false
math: false
gallery: false
showinfocard: true
enablecomment: true

series: Gist
previous:
next:

confidence: 
importance: 

tags:
- Authentik

categories:
- Gist

# type: file, link, image, and others
extramaterials:


copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

默认情况下，注册了 Social Login Source 并绑定到 Default-identification-stage 的 Authentik 实例允许任何拥有该 Social Login 账户的用户注册为 Authentik 用户。

虽然这个过程，default-source-enrollment 中的 [write stage](https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/user_write/) 默认创建的是 External 用户，他们默认是无法访问 Authentik 应用列表界面的 ([source](https://github.com/goauthentik/authentik/discussions/11658#discussioncomment-11238293))。

我个人的需求是，允许已有用户通过 Social Login 绑定账户，但禁止外部用户通过 Social Login 注册新账户。这里具体的 Social Login IdP 是 GitHub。

我首先创建了一个新的 Expression Policy，内容如下：

```python
# default-source-enrollment-if-github-idp

if context["source"].provider_type != "github":  # Allow other source
    return True

# Get the logged in user's email
github_user_email = context["oauth_userinfo"]["email"]

# Find if user exists
if ak_user_by(email__iexact=github_user_email):
    return True

ak_message("New user signup via GitHub is not supported. This attempt has been logged.")
return False
```

然后在 default-source-enrollment 的 binding 中绑定这个新的 Policy。

需要注意的是，default-source-enrollment 已经预先绑定了 default-source-enrollment-if-sso 的策略，这个策略允许 SSO 登录的用户访问流程，如果删除这个策略，SSO 登录的用户将无法登录。我这边的处理是通过 order 参数将新策略放在这后面执行。

这样一来，只有当用户通过 GitHub Social Login 并且邮箱在 Authentik 中不存在时，注册流程才会被阻止，达到了禁止外部用户通过 SSO 注册的目的。
