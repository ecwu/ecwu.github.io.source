+++
title = "Switching to a new theme ... I guess"
subtitle = "Tailwind + Hugo"
author = "Zhenghao Wu"
description = ""
hidedate = false
date = 2021-12-23T00:35:45+08:00
hidereadtime = false
draft = false
math = true
toc = false
tags = [
    "website",
    "hugo",
    "tailwind",
    "theme"
]
categories = [
    "Note",
    "Website",
]
menu = "main"
featureimage = ""
+++

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


Stay tuned.