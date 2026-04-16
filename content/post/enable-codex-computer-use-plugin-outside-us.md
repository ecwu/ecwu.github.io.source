---
title: 手动启用 Codex Computer Use 插件
subtitle:
author: Zhenghao Wu
description: 记录如何在 Codex for Mac 中手动启用 Computer Use 插件，并通过 bundled marketplace 完成安装和配置。
featureimage:
unsplashfeatureimage:

publishDate: "2026-04-16T22:00:00+01:00"
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

series:
previous:
next:

confidence: Verified in practice
importance: 7

tags:
- Codex
- OpenAI
- Computer Use
- macOS
- Plugin
- CLI
- Tutorial

categories:
- Tutorial
- Tech

# type: file, link, image, and others
extramaterials:

copyright:
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## 背景

[Codex 随着新版本推出了 Computer Use 功能](https://openai.com/index/codex-for-almost-everything/)，但它并没有在 UK 和欧洲地区正式开放。

具体表现是：打开 Codex 的设置页面，在 **Computer use** 一栏里会直接显示 **Computer Use plugin unavailable**，因此无法宣传里直接安装和使用这个插件。

不过，Codex for Mac 的应用包里其实已经自带了这个插件相关内容。只要把 bundled plugins 目录手动加到 marketplace，并启用对应的实验功能，就可以让插件重新出现在设置页里。

## 我的环境

本文记录时使用的是下面这个版本组合：

- Codex for Mac: `Version 26.415.20818 (1727)`
- `codex-cli`: `0.121.0`

## 先确认本地已经带了插件

先看一下 Codex.app 的 bundled plugins 目录：

```txt
/Applications/Codex.app/Contents/Resources/plugins/openai-bundled/plugins/computer-use
```

在这个目录下，我可以看到 **Codex Computer Use.app**。这说明插件本体其实已经跟着桌面应用一起分发了，只是当前地区默认没有在设置里开放出来。

## 第一步：把 bundled plugins 加成一个 marketplace

先在终端执行下面这条命令：

```bash
codex marketplace add /Applications/Codex.app/Contents/Resources/plugins/openai-bundled
```

这一步的作用，是把 Codex 应用自带的 `openai-bundled` 目录作为一个 marketplace 加进 CLI 配置里。  
如果不做这一步，后续即使本地有插件文件，Codex 也不会把它当成一个可安装来源。

## 第二步：确认插件在配置里是启用状态

然后检查 `~/.codex/config.toml`，确认里面有下面这段配置：

```toml
[plugins."computer-use@openai-bundled"]
enabled = true
```

如果没有，就手动加上。

这里的含义很直接：

- `computer-use` 是插件名
- `openai-bundled` 是刚刚加入的 marketplace
- `enabled = true` 表示这个插件在本地配置里处于启用状态

## 第三步：启用 remote_control 功能

接着执行：

```bash
codex features enable remote_control
```

这一步很关键。因为 Computer Use 依赖 `remote_control` 这个仍带有研发/实验性质的功能开关。  
即使前面的 marketplace 和插件配置都正确，如果这个 feature 没打开，可能也无法让插件正常工作。

## 第四步：重启 Codex for Mac

完成上面三步后，彻底退出并重新打开 Codex。

重启之后，再进入设置页的 **Computer use**，这时就应该能看到 Computer Use 插件，而不再是之前的 **Computer Use plugin unavailable**。接下来直接点击安装即可。

## 这个插件大概是怎么工作的

从实际安装和启用方式来看，Computer Use 应该是以 MCP 插件的形式注册到 Codex 里。它能做事情包括：

1. 先读取当前系统里有哪些应用和可操作环境
2. 通过截图获取应用界面内容（就算在后台也可以）
3. 根据界面内容理解窗口、按钮、输入框和状态
4. 再通过模拟点击、输入、切换窗口等方式完成操作

这其实就是 [OpenAI CUA（Computer User Agent）](https://openai.com/index/computer-using-agent/) 研究中就设计了的能力。甚至之前推出的 [Agent Mode](https://openai.com/index/introducing-chatgpt-agent/) 可能用的是一样的底层技术。

## 安装后的权限要求

插件装好以后，还不能立刻使用。第一次实际调用时，macOS 通常还会要求你授予两类权限：

1. 屏幕录制权限
2. 控制电脑或辅助功能相关权限

Codex 会引导你跳到系统设置里完成授权。把这些权限打开之后，Computer Use 才能正常读取屏幕内容并执行点击、输入等操作。

## 最后

截至本文记录时，Computer Use 仅在美国正式推出，该方式未来可能会失效，也可能会随着版本更新而变化。

方法仅供个人测试和研究用途。是否继续使用、以及由此带来的兼容性或稳定性问题，需要你自己判断和承担。
