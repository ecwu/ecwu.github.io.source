---
title: "Blog Theme: ecwu-theme"
subtitle: Building a Minimalist Hugo Theme with Tailwind CSS
author: Zhenghao Wu
description: A deep dive into my custom Hugo theme that powers this blog - from design philosophy to technical implementation
featureimage:
unsplashfeatureimage:

publishDate: "2025-10-26T21:00:00+00:00"
lastmod: "2025-10-28T10:00:00+00:00"
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: true
math: true
gallery: true
showinfocard: true
enablecomment: true

series:
previous:
next:

confidence: High
importance: 9

tags:
- Hugo
- Tailwind CSS
- Web Development
- Theme Development
- Design System

categories:
- Website

# type: file, link, image, and others
extramaterials:
- type: link
  name: ecwu-theme Repository
  url: https://github.com/ecwu/ecwu-theme
- type: link
  name: Hugo Documentation
  url: https://gohugo.io/
- type: link
  name: Tailwind CSS v4
  url: https://tailwindcss.com/

copyright: byncsa
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## Introduction

Every developer who maintains a blog eventually faces the question: **Should I use an existing theme or build my own?** For me, this wasn't just about aesthetics - it was about creating the perfect reading experience for both technical tutorials and personal reflections.

After years of blogging on various platforms and using different Hugo themes, I found myself constantly wanting just one more feature, a slightly different margin, or better typography for code blocks. Rather than continuing to patch someone else's theme, I decided to build **ecwu-theme** from the ground up.

This theme represents my taste of what a minimalist blog should be: clean, functional, and focused on content while supporting advanced features for technical writing, multimedia content, and structured discourse. Let me walk you through the design and technical stack for this theme.

## Design

### Reading-First Approach

The core principle behind ecwu-theme is reading experience. When you visit a blog, you're there to read - everything else should support that primary goal without distraction.

This manifests in several key design decisions:

- **Optimal line length**: Content is constrained to 55% width on desktop (90% on mobile). This width limits eye movement and improves comprehension. Such design also handy when nowadays screen getting wider and wider.
- **Generous whitespace**: No cluttered sidebars or dense layouts. Typography is given room to breathe.
- **Typography hierarchy**: Clear visual distinction between headings, body text, and metadata. This is achieved through tailwind's typography utilities.
- **High contrast**: Dark mode and light mode both prioritize legibility with appropriate color choices.

### Inspiration from Tufte Hugo Theme

A major inspiration for this theme was the **Tufte Hugo theme**, which I used before creating ecwu-theme. The Tufte theme is based on Edward Tufte's design philosophy and implements his principles for web content. What I borrowed directly from that theme were:

- **Left-aligned content areas**: Maximizing readability by avoiding centered text
- **The et-book font**: I carried over this serif font choice that gives articles their academic feel

## Technical Stack

### Hugo + Tailwind CSS

The foundation is simple but powerful:

- **Hugo**: The static site generator that handles content management, routing, and template rendering
- **Tailwind CSS**: A utility-first CSS framework that provides rapid development capabilities

I chose Tailwind CSS for its flexibility and performance benefits:

- **Utility-first approach**: Write styles directly in HTML, making maintenance easier
- **Customizable**: Easy to extend with custom utilities and components
- **Production-optimized**: Automatically removes unused CSS for smaller bundle sizes

The theme is structured as a **git submodule**, allowing me to develop it separately while keeping the main site clean. This separation makes it easier to manage theme-specific code independently from the blog content.

## Core Features

### Content Features

The theme includes several features specifically designed for structured content of all types:

#### Series Management
For multi-part content, the series system automatically:
- Shows navigation between related posts
- Tracks reading progress
- Displays series overview cards

#### Enhanced Metadata
Beyond standard blog metadata, I've added:
- **Confidence levels**: How confident I am about the content
- **Importance ratings**: How critical the information is
- **Status tracking**: Draft → In Progress → Finished
- **Reading time**: Based on content analysis

#### Table of Contents
For long-form content, the enabled TOC provides:
- Generates from heading structure
- Provides smooth anchor navigation

### Advanced Gallery System

The gallery system is designed to handle visual content elegantly, whether you're showcasing photography, design work, screenshots, or any other imagery. The gallery shortcode provides:

- **Horizontal scrolling**: Works on both desktop and mobile
- **Keyboard navigation**: Shift + scroll for desktop users
- **Responsive images**: Proper sizing
- **Rich metadata**: Support for descriptions, captions, and custom fields

### Article Info Card

The article info card is a comprehensive metadata display system that provides readers with detailed information about each post. When enabled via `showinfocard: true` in the frontmatter, it displays:

- **Author information**: With customizable author names
- **Publication dates**: Both original publication and last modification dates
- **Tag system**: Clickable tags that link to related content
- **Extra materials**: Downloadable resources with file type icons (files, images, links)
- **Technical details**: Camera, lens, and medium information for photography posts
- **Copyright information**: Automatic copyright display based on settings

The info card uses a clean table layout with proper dark mode support and responsive design. It's perfect for academic content, technical documentation, or any post where readers might want to reference specific details about the creation process.

## Shortcode Ecosystem

Shortcodes are Hugo's way of adding custom content elements, and ecwu-theme includes several specialized ones:

### Technical Content
- **Mermaid diagrams**: Automatically themed for dark/light mode
- **Sidenotes**: Academic-style marginal notes
- **PDF embedding**: For papers and documentation

### Media Features
- **Video embedding**: Two shortcodes available (`video` and `embed-video`) with custom controls and responsive sizing. embed-video supports two video platforms: YouTube and Bilibili.
- **Image galleries**: As mentioned above

### Utility Shortcodes
- **Enhanced figures**: Advanced figure shortcode with rich caption support

All shortcodes are demonstrated in the [cloudflare pages staging site](https://ecwu-github-io-source.pages.dev/post/reference/shortcode/) for easy reference.

## Additional Theme Features

Beyond shortcodes, the theme includes several integrated systems:

### Discussion System
- **Giscus integration**: GitHub Discussions-based comment system with automatic dark mode theming
- **Theme-aware comments**: Comments automatically adapt when users switch between light and dark modes

### Math Equations
- **KaTeX support**: For rendering $\LaTeX$-style math equations inline or in blocks


$$\nabla_\mu F^{\mu\nu} + \frac{\lambda}{M^2}\nabla_\mu\!\left(\phi\, F^{\mu\nu} + (\nabla^\mu \phi)(\nabla_\rho F^{\rho\nu})\right) = j^\nu + g\,\bar{\psi}\gamma^\nu\psi + \alpha\, R^{\nu}_{\ \mu}\nabla^\mu \phi$$

### Analytics Integration
- **Google Analytics**: Easy integration via Hugo parameters

## Future Development

This theme is continuously evolving. Some features I'm working on:

- **I18n support**: Multi-language capabilities
- **Accessibility improvements**: WCAG compliance
- **New shortcodes**: Flowcharts, timelines, etc.

## Conclusion

If you're a developer or academic looking for a theme that provides a clean, functional reading experience, I hope ecwu-theme provides some inspiration. And if you're interested in using or contributing to the theme, the repository is open source.

Feel free to reach out if you have any questions or suggestions!
