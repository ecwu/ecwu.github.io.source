---
title: Shortcode Test Post
subtitle: Try out all shortcodes
author: Zhenghao Wu
description: A test post for the new theme
layout: 
isCJKLanguage: false
featureimage: https://unsplash.com/photos/GSnMWuCbov8/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjQxNjQyOTA1&force=true
unsplashfeatureimage: Andrew Seaman

showmeta: false
publishDate: "2022-01-01T17:44:45+08:00"
lastmod: "2022-01-03T17:44:45+08:00"
draft: true
status: finished

showmeta: true
hidereadtime: false
toc: true
math: true
showinfocard: true
enablecomment: false

series:
previous:
next:

confidence: high
importance: 5

tags:
- Test
- Hugo
- Theme
- Markdown
- LaTeX
- Style

categories:
- Site

extramaterials:

copyright: cc0
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## Available Shortcodes Test

This document tests all available shortcodes in the ecwu-theme.

### 1. Figure Shortcode

The `figure` shortcode displays an image with optional caption and attribution.

{{< figure src="https://unsplash.com/photos/GSnMWuCbov8/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjQxNjQyOTA1&force=true" alt="Test Image" title="Figure Title" caption="This is a test figure with caption" attr="Photo by Andrew Seaman" attrlink="https://unsplash.com" >}}

### 2. Video Shortcode

The `video` shortcode embeds a video with optional loop and autoplay.

{{< video video-url="https://www.w3schools.com/html/mov_bbb.mp4" >}}

{{< video video-url="https://www.w3schools.com/html/mov_bbb.mp4" is-loop="true" >}}

### 3. Embed Video Shortcode

The `embed-video` shortcode embeds videos from YouTube or Bilibili.

**YouTube Example:**
{{< embed-video id="dQw4w9WgXcQ" site="youtube" >}}

**Bilibili Example:**
{{< embed-video id="BV1xx411c7mD" site="bilibili" >}}

### 4. PDF Shortcode

The `pdf` shortcode embeds a PDF document.

{{< pdf pdf-url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" >}}

### 5. Sidenote Shortcode

The {{< sidenote >}}sidenote{{< /sidenote >}} shortcode creates an inline highlighted note.

### 6. Marginnote Shortcode

The {{< marginnote >}}marginnote{{< /marginnote >}} shortcode also creates an inline highlighted note (identical styling to sidenote).

### 7. Section Shortcode

The `section` shortcode helps create HTML sections with custom classes and IDs.

{{< section class="my-custom-section" id="test-section" >}}

This content is inside a custom section with class "my-custom-section" and id "test-section".

{{< section "end" >}}

### 8. Gallery Shortcode

The `gallery` shortcode creates a horizontal scrolling gallery of images.

{{< gallery g-class="custom-gallery" >}}
{{< gallery-image image-url="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" image-description="Mountain landscape" >}}
{{< gallery-image image-url="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400" image-description="Forest path" >}}
{{< gallery-image image-url="https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400" image-description="Lake view" >}}
{{< gallery-image image-url="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400" image-description="Desert landscape" >}}
{{< gallery "end" >}}

### 9. Gallery Image Shortcode

The `gallery-image` shortcode is used within the gallery shortcode (see above example).

### 10. Friend Item Shortcode

The `friend-item` shortcode creates a friend link card.

<ul class="divide-y divide-gray-200 dark:divide-gray-700">
{{< friend-item img="https://avatars.githubusercontent.com/u/12345?v=4" title="Example Friend" desc="A description of this friend's site" url="https://example.com" >}}
{{< friend-item img="https://avatars.githubusercontent.com/u/67890?v=4" title="Another Friend" desc="Another cool website" url="https://anotherexample.com" >}}
</ul>

### 11. Include HTML Shortcode

The `include-html` shortcode includes an external HTML file from the same directory.

<!-- Note: This requires an HTML file in the same directory -->
<!-- {{< include-html "example.html" >}} -->

## Shortcode Summary

All 11 shortcodes available in the theme:

1. **figure** - Display images with captions
2. **video** - Embed video files
3. **embed-video** - Embed YouTube/Bilibili videos
4. **pdf** - Embed PDF documents
5. **sidenote** - Inline highlighted notes
6. **marginnote** - Inline highlighted notes (same as sidenote)
7. **section** - Create custom HTML sections
8. **gallery** - Horizontal scrolling image gallery
9. **gallery-image** - Individual images within gallery
10. **friend-item** - Friend link cards
11. **include-html** - Include external HTML files

