---
title: (Switched!) Switching to a new theme ... I guess
subtitle: Tailwind + Hugo
author: Zhenghao Wu
description: 
featureimage: 
unsplashfeatureimage: 

publishDate: "2021-12-22T16:35:45.000Z"
lastmod: "2025-10-26T22:00:00+00:00"
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: true
toc: false
math: true
gallery: false
showinfocard: true
enablecomment: true

series: Website Note

confidence: certain
importance: 6

tags:
- website
- hugo
- tailwind
- theme

categories:
- Tech
- Website

# type: file, link, image, and others
extramaterials:

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

This blogsite has been using [hugo-tufte](https://github.com/shawnohare/hugo-tufte) theme (with some customization) for a while. I choose the theme because I appreciate the aesthetic look of the original Tufte $\LaTeX$ template. Using a dedicated area on the right side of the page for sidenotes, supplements images, or thoughts. Diversify the layout of an article, and make the article fun to read.

A couple of months ago, under my willingness of making enhancements to the theme. And I start to do some research on how other people are doing sidenote on their blog (Like the [great article](https://www.gwern.net/Sidenotes) by Gwern Branwen). With some "deep thinking". I start to realize. Maybe it is not a good idea to use footnotes on the Internet pages. 

Not only because it is hard to using (in Hugo, those sidenotes were created using [shortcodes](https://gohugo.io/content-management/shortcodes/), and you have many of them), also because it may break the flow of reading (but for sure better than footnote and endnote in reading experience); make the HTML and markdown source semantically not-understandable and almost no compatibility with other themes.

More personal complaints like:
- No dark theme support
- Broken responsive implementation
- lacking grid system

In a sentence, I decided to rewrite the theme from scratch. 

And using [Tailwind CSS 3](https://tailwindcss.com/blog/tailwindcss-v3) instead of Bootstrap which I am more familiar with. Converts all posts with sidenote into another format (still thinking the format). During the process, I may share some of my experiences, especially the Tailwind + Hugo workflow.

## 2021.12.27 Update

The theme has been warmed up and some preliminary layout has been implemented. But as a previous [bootstrap](https://getbootstrap.com/) user, I have to say the experience with Tailwind is a bitter-sweet story. 

Similarly use way of applying classes to the elements. What Tailwind provides are more underlying levels of building blocks. And with a tiny number of demos. So it is not so intuitive when I implement stuff.

The Tailwind UI is the official component library, and it has a paywall (not cheap). So, don't take for granted the bootstrap official examples.

## 2022.1.8 Update

A lot has been done in the past two weeks. And the theme is almost ready but still needs some tweaking. I borrow a lot of ideas from other Hugo themes, but the main idea is still **Make it simple**.

![designstandard](http://cdn.ecwuuuuu.com/blog/image/designstandard/designstandard.001.jpeg-compressed.webp)

Setting up a new theme is a quite messy process, have to consider an overwhelming amount of items and elements. So to make sure the unified style across the site, I create a design guideline that defines the overall coloring, placement of modules, and sizing. This saves me from designing by eye page by page.

I provide [the guidelines](http://cdn.ecwuuuuu.com/blog/image/designstandard/designstandard.pdf) here and you can also check out the contiguous [building site](https://ecwu-github-io-source.pages.dev/) that has the new theme enabled (Powered by Cloudflare pages).

## 2022.1.9 Update

The [new theme](https://github.com/ecwu/ecwu-theme) has been applied on the site, I probably will write a post to introduce the new theme. Feel free to explore the site, and give me some feedback in the comment section.

## 2025.10.26 Update

I finally wrote a detailed post about the theme: [New Blog Theme: ecwu-theme](/post/blog-theme-ecwu-theme/). The theme is also getting evolved with new features and improvements. Check out the [changelog](/page/changelog/) for the latest updates!