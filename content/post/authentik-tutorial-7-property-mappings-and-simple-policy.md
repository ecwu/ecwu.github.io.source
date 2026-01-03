---
title: Authentik 教程系列：属性映射与简单的策略(Policy)
subtitle: 
author: Zhenghao Wu
description: 
featureimage: 
unsplashfeatureimage: 

publishDate: "2025-12-22T16:18:51Z"
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
- Policy
- Property Mapping


categories:
- Tutorial

# type: file, link, image, and others
extramaterials:

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---



## 属性映射（Property Mappings）

属性映射是将用户的属性（如用户名、电子邮件等）从一种格式转换为另一种格式的过程。通过 Python 表达式来实现的，可以在 Authentik 的各种 Source 和 Provider 中使用。属性映射允许我们根据需要自定义用户属性，以满足不同服务的要求。

最常见使用的场景是，外部身份提供者返回的属性名与 Authentik 中预期的不一致，就拿 OIDC 来说，[types/oidc.py](https://github.com/goauthentik/authentik/blob/97ef6a5eb2f25996991fc2f9e370ec8a91fa021e/authentik/sources/oauth/types/oidc.py#L60C5-L66C10) 文件定义了基础的用户属性：

    ```python
    def get_base_user_properties(self, info: dict[str, Any], **kwargs) -> dict[str, Any]:
        return {
            "username": info.get("nickname", info.get("preferred_username")),
            "email": info.get("email"),
            "name": info.get("name"),
            "groups": info.get("groups", []),
        }
    ```

可以看到 Authentik 期望从 OIDC 提供者获取 `email` 属性来作为用户名，但有些提供者可能返回的是 `email_address`。这种情况下，我们就可以使用属性映射来调整这个属性的名称。

还有一种常见情况是，我们想存储一些自定义属性。例如，用户的头像，公司内的职位信息，手机号等。

### 案例 - 飞书

根据我们使用的 [userinfo endpoint](https://open.feishu.cn/document/deprecated-guide/app-login/api-reference/get-user-info) 返回的数据结构，飞书返回的用户信息如下：

```json
{
    "sub": "ou_caecc734c2e3328a62489fe0648c4b98779515d3",
    "name": "李雷",
    "picture": "https://www.feishu.cn/avatar",
    "open_id": "ou_caecc734c2e3328a62489fe0648c4b98779515d3",
    "union_id": "on_d89jhsdhjsajkda7828enjdj328ydhhw3u43yjhdj",
    "en_name": "Lilei",
    "tenant_key": "736588c92lxf175d",
    "avatar_url": "www.feishu.cn/avatar/icon",
    "avatar_thumb": "www.feishu.cn/avatar/icon_thumb",
    "avatar_middle": "www.feishu.cn/avatar/icon_middle",
    "avatar_big": "www.feishu.cn/avatar/icon_big",
    "email": "zhangsan@feishu.cn",
    "user_id": "5d9bdxxx",
    "employee_no": "111222333",
    "mobile": "+86130xxxx0000"
}
```

可以看到，飞书返回的用户信息中，并没有 `username` 属性。这个时候，我们就可以通过属性映射来指定 `username` 应该使用 `user_id` 属性。另外，我们还可以将头像 URL，员工编号，手机号等信息也存储为用户的自定义属性。

```python
return {
  "username": info.get("user_id"),
  "email": info.get("email"),
  "name": info.get("name"),
  "attributes": {
    "avatar": info.get("avatar_url"),
    "employee_no": info.get("employee_no"),
    "mobile": info.get("mobile"),
  },
}
```

## 策略（Policy）

策略是用于控制用户访问权限和行为的规则集合。这些规则可以在 Authentik 中的各种流程（Flow）中绑定，并在流程运行时执行并检查。

Authentik 提供了多种内置策略类型：

- **Expression Policy**：使用 Python 表达式来动态决定策略结果。这是最灵活的策略类型，也是我们本章会涉及的内容。
- **Event-matcher Policy**：用于事件子系统，根据标准匹配事件。
- **GeoIP Policy**：基于地理位置（如国家或 ASN）控制登录尝试。
- **Password Policy**：设定密码规则（长度、字符类型）及检查弱密码。
- **Reputation Policy**：根据登录成功/失败的历史计算信誉分。
- 其他还包括 **Password-Expiry Policy**（密码过期）和 **Password Uniqueness Policy**（密码唯一性）等。

策略我们之前的教程就接触过，比如使用密码复杂度策略来强制设置密码的强度。