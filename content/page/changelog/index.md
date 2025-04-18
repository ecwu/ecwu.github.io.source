---
title: Changelog
subtitle: Tech Stack & Changelog
author: Zhenghao Wu
description: 
featureimage: 
unsplashfeatureimage: 

publishDate: "2022-01-09T14:49:18+08:00"
draft: false
status: 
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: true
toc: true
math: false
gallery: false
showinfocard: false
enablecomment: false

series: 

confidence: 
importance: 

tags:

categories:
- Topic
- Page

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---


## About this site
- Write with static site generator [Hugo](https://gohugo.io/)
    - Uses [ecwu-theme](https://github.com/ecwu/ecwu-theme) from Jan 2022, Theme introduction: `TBA`
- Build with [GitHub Actions](https://github.com/features/actions)
- Site preview build with [Cloudflare Pages](https://pages.cloudflare.com/)
    - https://ecwu-github-io-source.pages.dev/
- Host by [GitHub Pages](https://pages.github.com/)
- [Cloudflare](https://www.cloudflare.com/) & [Qiniu](https://www.qiniu.com/) for distributing files
- Comment Plugin: [giscus](https://github.com/giscus/giscus)
- Site Analytics: [Google Analytics v4](https://support.google.com/analytics/answer/10089681?hl=en)
- LaTeX Render: [KaTeX](https://katex.org)


## Changelog

### 2025

#### April 2025

- Adding a new "no-dark-invert" class for dark mode to prevent dark mode inversion for some images

#### February 2025

- Update the Tailwind CSS to v4
- Update the KaTeX to v0.16.21
- Adjust the style for homepage card to match the design system
- Adding support for youtube and bilibili embeds

### 2024

#### October 2024

- Update the build pipeline with Hugo 0.134.2
- Change the tag for site logo/title from `<h1>` to `<div>` for better SEO

#### May 2024

- Refreshing the design and layout for friends page, adding avatar for each item.

### 2022

#### October 2022

- Warp the main content with `<main>` tags, improving RSS scraping results.

#### April 2022
- Replace comment plugins: [utterances](https://utteranc.es) -> [giscus](https://github.com/giscus/giscus)
- Migrate legacy comments from GitHub Issues to GitHub Discussion

#### February 2022
- Adding shortcode for PDF (Tailwind Aspect-ratio plugin)
- Refines and adding labels for Draft post 
- Adding shortcode for embeds html file
- Adding video looping args for video shortcode
- Fix a bug in article time and read time metadata display

#### January 2022
- Enable the new [ecwu-theme](https://github.com/ecwu/ecwu-theme), Written in [Tailwind CSS 3](https://tailwindcss.com/)
- Adding Comment Plugin [utterances](https://utteranc.es)
- Adding Site Analytics [Google Analytics v4](https://support.google.com/analytics/answer/10089681?hl=en)
- New `Terms`, `Series` View and Pages.
- New Article Info Card
- New Gallery Implementation with JS.
- Remove Sidenote
- Adding shortcode for video (via CDN)

### Pre 2022
- Using [hugo-tufte](https://github.com/shawnohare/hugo-tufte) theme with custom modifications