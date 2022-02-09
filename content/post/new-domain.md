---
title: I am initiating a new domain!
subtitle: 
author: Zhenghao Wu
description: 'ecwu.xyz, and other news about my site'
featureimage: 
unsplashfeatureimage: 

publishDate: "2021-09-01T14:40:01+08:00"
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
- Domain
- dotxyz
- .xyz
- Cloudflare
- Gandi
- website

categories:
- Tech
- Website

# type: file, link, image, and others
extramaterials:

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

Starting from Aug 11, 2021. I am starting a new domain name for my website.

> [ecwu.xyz](https://ecwu.xyz)

Personally, the old domain name (ecwuuuuu.com) is good but is it a little bit longer in length and maybe difficult for people to memorize and use. So, I register this domain name to create some convenience for others (but mostly for myself :)).

Currently, I am don't have a concrete plan for how to utilize these two domains. But I will probably migrate all my info page and service to the new domain. The domain email and blog will still keep in the old one. I will keep thinking about this, and sync the progress on this page in the future.

Update log:
- 2022.02.09: A new homepage build with flame has been deployed.
- 2022.01.24: Multiple services are deployed under the domain, most of the services are used privately and host on Tencent Cloud; I recently go through a personal homepage project called [flame](https://github.com/pawelmalak/flame), I tend to replace it with the current landing page built with Netlify.
- 2022.01.22: [Cloudflare Email Routing](https://blog.cloudflare.com/introducing-email-routing/) Service is enabled, you can use `hi@ecwu.xyz` to sent me email.
- 2021.09.01: A Landing page is setup for the site, CI with [Netlify](https://www.netlify.com/).
- 2021.08.11: Accessing the [root](https://ecwu.xyz) and [www](https://www.ecwu.xyz) subdomain of the new domain will 302 redirect to [ecwuuuuu.com](https://ecwuuuuu.com) via a URL forwarding rule using Cloudflare.

More info:
- This domain is register at Gandi.com
- ~~I launch a new subdomain [foto.ecwuuuuu.com](https://foto.ecwuuuuu.com) [chaos.ecwuuuuu.com](https://chaos.ecwuuuuu.com)~~ with [Ghost](https://github.com/TryGhost/Ghost) as backend. I tend to use it as a more friendly and more good-looking site for my photo project. But I don't guarantee the service will run without termination in the future.
  - 2022.01.24: A problem with Nginx and Ghost (running in Docker) causing redirect loop and showing an `ERR_TOO_MANY_REDIRECTS` error. Taking down the site till further notice.
