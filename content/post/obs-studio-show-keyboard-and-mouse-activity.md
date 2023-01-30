---
title: 使用 input-overlay 工具在 OBS Studio 中展示鼠标和按键操作
subtitle: 
author: Zhenghao Wu
description: 
featureimage: http://cdn.ecwuuuuu.com/blog/image/obs-input-overlay-cover.png
unsplashfeatureimage: 

publishDate: "2023-01-31T00:16:08+08:00"
lastmod: 
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: false
math: false
gallery: true
showinfocard: true
enablecomment: true

series:
previous:
next:

confidence: highly likely
importance: 7

tags:
- OBS Studio
- Streaming
- Screen capture
- Live
- Plugin
- Tutorial
- input-overlay

categories:
- Streaming
- OBS Studio
- Tutorial

# type: file, link, image, and others
extramaterials:
- type: file
  name: custom keyboard and mouse history preset (GitHub Gist)
  url: https://gist.github.com/ecwu/fc2a5a143d2d3a29fb9c459deaf009b8

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

> 最近折腾了下 OBS Studio 的 [input-overlay](https://github.com/univrsal/input-overlay) 插件，考虑到该插件的中文教程不多，特将折腾过程记录为本文。

## 什么是 input-overlay

![input-overlay 使用中的效果](https://camo.githubusercontent.com/925ac0d1526f620d1669077ed909daf2ff8318ae9ffcecd14f790090de0b39ec/68747470733a2f2f692e696d6775722e636f6d2f6e5067707352782e706e67)

[input-overlay](https://github.com/univrsal/input-overlay) 是由 [Alex (univrsal)](https://vrsal.xyz/) 开发的一个 OBS Studio 插件。安装后，可以在 OBS Studio 中增加新的来源（source）用于展示鼠标、键盘、甚至是各种游戏手柄的操作。可以在游戏操作教学、软件教程类直播中提升直播时的效果。

## input-overlay 的安装

插件支持 Linux 和 Windows (32-bits, 64-bits)，安装用到的文件可以到官方的 [GitHub Release](https://github.com/univrsal/input-overlay/releases/tag/v5.0.0) 下载（写文章时最新版本是 v5.0.0，只支持 OBS Studio 28.0.0 和更高版本，笔者正在使用 OBS Studio 29.0.0）。其中 Windows 还提供安装包（`input-overlay-5.0.0-windows-x64-Installer.exe`），只需要确认好 OBS Studio 安装的位置。

![使用安装包安装](http://cdn.ecwuuuuu.com/blog/image/input-overlay-installer.png)

另外一种安装方法是将相应的文件复制进 OBS Studio 的目录。下载下来的文件夹与 OBS 目录下一一对应，只需要直接覆盖即可。

![通过复制文件的方式安装](http://cdn.ecwuuuuu.com/blog/image/input-overlay-file-replace.png)

安装完成后，你就可以在 OBS Studio 的来源区域，找到并添加 Input Overlay （中文翻译：输入叠加）。

![成功安装后可以在 OBS 内看到添加“输入叠加”源](http://cdn.ecwuuuuu.com/blog/image/input-overlay-in-obs-source.png)

## input-overlay 的 preset （预设）

![input-overlay 的属性配置页](http://cdn.ecwuuuuu.com/blog/image/input-overlay-in-obs-settings.png)

当你添加了“输入叠加”源后，会看到如图的属性配置页，会要求你加载“贴图”和“配置”两个文件。这两个文件决定 input-overlay 插件显示哪些、以什么样式显示你的外设输入或操作。官方已经提供了一些做好的文件，称为 preset，同样可以在官方的 [GitHub Release](https://github.com/univrsal/input-overlay/releases/download/v5.0.0/input-overlay-5.0.0-presets.zip) 下载。下面展示一些常用的官方预设。


![input-overlay 官方 Preset](http://cdn.ecwuuuuu.com/blog/image/input-overlay-presets-v2.png)

## 使用 “按键历史显示” preset 

早期一些，有一个 Input History 的插件可以用于显示按键的历史。但是目前已经不再更新。但它的功能可以使用 input-overlay 实现，官方提供的预设中 `input-history-windows` 即为实现版本。基本的想法是：

1. 启用 input-overlay 的 websocket 服务器，使得所有的操作会被 websocket 发送，并能被接收端接受并处理
2. 在 OBS Studio 中添加一个浏览器，并加载提供的 HTML 文件。该文件会被 OBS 使用一个简单 HTTP 服务端托管并显示在画面中。因为 HTML 是通过服务端展示，所以 websocket 请求能被正常处理。
3. 加载的 HTML 文件中，会请求 websocket 接口并将需要的按键信息处理出来，最后以渲染 DOM 元素的形式展示被按下的按键和按键历史。

![input-overlay 按键历史显示 Preset 效果](http://cdn.ecwuuuuu.com/blog/image/input-overlay-history-demo.png)

要启用需要以下几步。

### 使用 “按键历史显示” preset 第一步：启用 input-overlay 的 websocket 服务器

![input-overlay 开启 websocket 配置](http://cdn.ecwuuuuu.com/blog/image/input-overlay-websocket-settings.png)

input-overlay 除了属性配置页，还有一个藏得比较深的全局配置页。位置在顶栏“工具”选项卡中，“输入叠加设置”按钮。点开后可以看到许多的配置，我们只需要将 “通过 websocket 服务器转发事件” 勾选，并确认端口设置为 `16899`。然后保存并重启 OBS Studio。

### 使用 “按键历史显示” preset 第二步：新建 “浏览器” 源

![input-overlay 新建历史浏览器源](http://cdn.ecwuuuuu.com/blog/image/input-overlay-source-settings-v2.png)

然后我们在主界面的“来源”区域创建一个新的浏览器源。配置中如图：勾选“本地文件”。然后选择本地的 `input-history-windows.html` 文件，并适当调整窗口的长宽（如果组合键比较多，可以适当将宽度增加，笔者使用了 1200px 的宽度。）。文件如果正常加载，按下键盘的按键就能在预览窗口看到按键的信息和历史。

## “按键历史显示” preset 的配置与小修改

### 显示效果的配置

“按键历史显示” 插件的所有效果配置都通过修改提供的 html 文件实现。在文件 553 行左右有如下脚本：

```js
    var HISTORY_MAX = 4;
    /**
     * Enable / Disable timeout for key combinations
     * @type {boolean}
     */
    var HISTORY_TIMEOUT_ACTIVE = true;
    /**
     * Time delay in ms before the key is hidden.
     * @type {number}
     */
    var HISTORY_TIMEOUT = 5000;
    /**
     * Separator between keys
     * @type {string}
     */
    var SEPARATOR = "+";
```

这里可以设置显示多少历史，历史是否消失，历史消失的延迟，组合键的连接符；你可以自行修改后，重启 OBS 查看效果。

###  “按键历史显示” preset 的小修改

官方提供的 Preset 只能对键盘事件进行显示和记录，有些时候需要显示鼠标事件时，这个 preset 就无法使用。对此，我研究了 websocket 得到的事件，知道了鼠标的事件为 `mouse_pressed` 和 `mouse_clicked`，并针对添加了这两个事件的捕获。显示组合键的部分，原作者使用集合 + map 映射的方式；但集合中并不包含鼠标的事件，为了防止出错，直接复用了 sun 键盘的键位编号 `0xff75` `0xff78`（原程序有定义，但是不会输出内容）。

我还对部分按键显示的名字进行了汉化，最后实现了插件能同时显示鼠标的点击与键盘的操作。

我将修改的 preset 放在了 [GitHub Gist](https://gist.github.com/ecwu/fc2a5a143d2d3a29fb9c459deaf009b8) 上，你可以试用并给出反馈。

## 编写你自己的 preset

除了官方提供的样式，你也可以自行编写，但这里不做过多介绍，你可以查看官方 repository 提供的 [wiki](https://github.com/univrsal/input-overlay/wiki)。