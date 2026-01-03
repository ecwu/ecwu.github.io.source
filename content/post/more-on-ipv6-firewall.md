---
title: More on IPv6 Firewall - EUI-64
subtitle: Errata for Previous DDNS Tutorial, And Some New Knowledge
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/40XgDxBfYXM/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8MXx8bmV0d29ya2luZ3xlbnwwfHx8fDE2NDQ2Nzc1OTU&force=true&w=2400
unsplashfeatureimage: Jordan Harrison

publishDate: "2022-02-13T14:42:23+08:00"
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

series: HomeLab
previous:
next:

confidence: likely
importance: 8

tags:
- Synology
- Linksys
- Asus
- Networking
- Firewall
- EUI-64

categories:
- Note

# type: file, link, image, and others
extramaterials:
- type: others
  name: IP Version 6 Addressing Architecture
  url: https://www.ietf.org/rfc/rfc2373.txt
- type: link
  name: Overview of the Security Tool in Linksys Smart Wi-Fi
  url: https://www.linksys.com/sg/support-article/?articleNum=140559
- type: link
  name: 正确地配置 IPv6 防火墙和 DDNS 以在公网访问设备
  url: https://rongrongbq.moe/2021/08/firewall-and-DDNS-settings-for-IPv6/
- type: link
  name: 家庭拨号动态前缀 IPv6 环境下的内部设备 IPv6 地址的端口放通
  url: https://blog.ihipop.com/2019/09/5232.html
  

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---
## Background

In the [Synology DDNS Tutorial]({{< ref "nas-ipv6-ddns.md" >}}), I have a [section]({{< ref "nas-ipv6-ddns.md#a-firewall" >}}) on setting up firewall on an ASUS AC68U Router.

For a recent update on my home network, the Asus router has been replaced with two Linksys WI-FI 6 tri-band mesh routers (two [MX5300](https://www.linksys.com/hk/whole-home-mesh-wifi/linksys-mx5-velop-ax-whole-home-wifi-6-system/p/p-mx5300/) or it's SKU MX10600-CN)。

I thought it will be easy to set up since I already have some experience and documentation, but the firewall is not working as intended.

## My Attempts
![](https://www.linksys.com/support/images/KB25634-011_EN_v1.png)
> Setting UI retrived from [Linksys Support](https://www.linksys.com/sg/support-article?articleNum=140330)

The IPv6 wirewall settings are located in `Router Settings > Security > IPv6 Port Services`. It has three crucial fields: Protocol (协议), IPv6 Address (IPv6 地址), Allow (允许). The first two are quite straightforward; "allow" meanings which range of port(s) will be open.

I find that I can't set up the "IPv6 Address" field as I intended. I can't fill in an address with mask-like strings together with a `/`. WebUI prompts that it is such a string is not a valid IPv6 address.

I tried some "valid" addresses:
1. The local IPv6 address starts with `fe80`, external requests cannot make it to the destination. 
2. The IPv6 address that been set to the Synology DDNS service. Fill in the full address allow access from WAN.

Up to now, the solution seems clear: use the full address instead of the kind mentioned in the first article. but it is a little bit complicated...

## More background
The IPv6 address for my devices is changing on a regular basis. So it will be annoying if I use full address: I need to update the `IPv6 Address` regulary.

There still exists some "pattern". In fact, the IPv6 address is generated based on EUI-64 ([RFC2373](https://datatracker.ietf.org/doc/html/rfc2373#page-19)) derive from [IEEE 802 48 bit MAC](https://datatracker.ietf.org/doc/html/rfc5342#section-2.1).

### EUI-64

For Example, your MAC address for the device is `00:00:5E:00:53:AF`. EUI-64 inserts hex values of `0xFF` and `0xFE` in the middle of the MAC address. Then flip the 7th bit from 0 to 1. The result should be `0200:5EFF:FE00:53AF`. And this address will keep not change unless you change your MAC address or network card.

```
|0              1|1              3|3              4|
|0              5|6              1|2              7|
+----------------+----------------+----------------+
|cccccc0gcccccccc|ccccccccmmmmmmmm|mmmmmmmmmmmmmmmm|
+----------------+----------------+----------------+

insert 0xFF and 0xFE (1111111111111110).

|0              1|1              3|3              4|4              6|
|0              5|6              1|2              7|8              3|
+----------------+----------------+----------------+----------------+
|cccccc1gcccccccc|cccccccc11111111|11111110mmmmmmmm|mmmmmmmmmmmmmmmm|
+----------------+----------------+----------------+----------------+
```
The EUI-64 result together with ISP IPv6 Prefix(`/64`), can form the final IPv6 address.

```
Assuming IPv6 Prefix is `2001:2002:2003:2004`

The final IPv6 address should be:

2001:2002:2003:2004:0200:5EFF:FE00:53AF
-------Prefix------ -EUI-64 Generated--
```

## Masking
Usually, subnet masking separates the IP into network and host addresses. Under IPv4, it defines the number of allowed hosts on a subnet. Or in other words, Only bits with their mask of 0 are allowed to change.

In the previous [Synology DDNS Tutorial]({{< ref "nas-ipv6-ddns.md" >}}). `::0000:8a2e:0370:7334/::ffff:ffff:ffff:ffff` is similar to subnet masking but masking backward. Double colon `::` omit the continuous 0s.

This is well suited for my use case since my ISP will change the prefix assigned to me but my EUI-64 address will keep unchanged. But such masking from the back (or should I call it arbitrary masking?) is not fully implemented for different systems or a standard. According to the source I found, such masking is supported by Netfilter/iptables [^1] and no easy notice documentation is available.

[^1]: [华硕 ipv6 防火墙动态 ip，怎么设置一直打开某一端口](https://www.right.com.cn/forum/thread-4052554-1-1.html#:~:text=%E5%8F%AF%E8%A7%81%20iptables%20%E5%AF%B9%20v6%20%E5%9C%B0%E5%9D%80%E7%9A%84%E5%8C%B9%E9%85%8D%E6%8E%A9%E7%A0%81%E5%8F%AF%E4%BB%A5%E9%9D%9E%E5%B8%B8%E7%81%B5%E6%B4%BB%EF%BC%8C%E4%B8%8D%E5%83%8F%20v4%20%E4%B8%8B%E5%8F%AA%E6%8C%89%E5%89%8D%E7%BC%80%E9%80%82%E9%85%8D%E3%80%82%E5%9D%91%E7%9A%84%E5%B0%B1%E6%98%AF%E8%BF%99%E4%B8%AA%E7%89%B9%E5%BE%81%E6%98%AF%E6%B2%A1%E6%9C%89%E6%96%87%E6%A1%A3%E7%9A%84%EF%BC%8C%E7%9B%AE%E5%89%8D%E6%96%87%E6%A1%A3%E4%B8%AD%E5%86%99%E7%9A%84%20mask%20%E8%A7%A3%E9%87%8A%E8%BF%98%E6%98%AF%E9%80%82%E9%85%8D%20IPv4%20%E7%9A%84%E5%86%85%E5%AE%B9%EF%BC%8C%E6%9C%89%E4%BA%BA%E4%B8%93%E9%97%A8%E5%8F%91%E9%82%AE%E4%BB%B6%E5%8E%BB%20netfilter%20%E5%88%97%E8%A1%A8%E9%97%AE%E4%BA%86%E6%89%8D%E7%9F%A5%E9%81%93%E3%80%82IPv6%20%E5%9C%B0%E5%9D%80%E4%B8%AD%EF%BC%8C%E5%8F%8C%E5%86%92%E5%8F%B7%EF%BC%9A%EF%BC%9A%E7%9A%84%E5%86%99%E6%B3%95%E4%BB%A3%E8%A1%A8%E6%98%AF%E5%89%8D%20/%20%E5%90%8E%E5%9D%87%E4%B8%BA%200%20%E4%BD%8D%EF%BC%8C%E5%8F%8C%E5%86%92%E5%8F%B7%E5%8F%AA%E8%83%BD%E5%87%BA%E7%8E%B0%E4%B8%80%E6%AC%A1%E3%80%82)

## Solution?

According to what I explored, **Linksys Velop** system doesn't have such implementation for changing IPv6 Address with fixed suffix. I already contacted their tech support and still waiting for a reply. So my less convent solution may be to move the firewall to my devices or simply ignore it for now and uses another way to access my devices (like FRP).