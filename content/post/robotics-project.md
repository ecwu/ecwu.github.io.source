---
title: 【记录】智能门锁 -  Introduction to Robotics 课程项目
subtitle: 也没那么智能
author: Zhenghao Wu
description: 
featureimage: http://cdn.ecwuuuuu.com/blog/image/project/smart-door/smart-door.jpg-compressed.webp
unsplashfeatureimage: 

publishDate: "2022-01-21T22:44:00+08:00"
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
enablecomment: false

series: Project
previous:
next:

confidence: 
importance: 

tags:
- Arduino
- Fingerprint
- Microphone
- RFID
- 3D Printing
- Smart Lock
- Robotic

categories:
- Project

# type: file, link, image, and others
extramaterials:
- type: file
  name: Project Source Code
  url: https://github.com/ecwu/COMP3073_ITR/tree/master/final_project

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## 整体构思
项目构思时浏览了很多网络上的 Arduino 项目建议。但列表中大多不够有趣，或时太复杂不容易实现。但其中遇到了一篇来自 Grathio Labs 的文章描述了使用敲门节奏驱动的智能门锁[^1]。

整个结构比较简单，除去锁转动结构的电机和 Arduino 主板，最重要的就是麦克风模块用于捕捉敲门。但只是的复现还不够，我们打算加入更多的功能，让门锁更加智能。

于是，我们在这基础上，设想了磁力检测自动关门、指纹识别、RFID 刷卡。

## 组成 · 硬件

### 主体结构
![结构原型](http://cdn.ecwuuuuu.com/blog/image/project/smart-door/prototype-door.jpg-compressed.webp)

原始的项目中，视频直接使用电机旋转门结构上的锁，但因为没有合适的电机、在学校的门上直接制作会难以携带和调试。于是我们决定制作一个小门的模型。

![门的模型](http://cdn.ecwuuuuu.com/blog/image/project/smart-door/door-front.jpeg-compressed.webp "no-dark-invert")

整个门使用胶合板制作，先使用使用 CAD 工具规划木板的切割，然后通过淘宝上的厂家进行激光切割后再组装。

到货后，切割的非常满意，但是组装时才发现设计时忽略了很多细节，比如缺少一些结构来稳固的托住元件、没有钻孔需要二次处理（学校也没有合适的电动工具）。但还好有边角料可以凑合使用，最后的门效果还不错。

### 锁

![齿轮结构](http://cdn.ecwuuuuu.com/blog/image/project/smart-door/gear.jpg-compressed.webp "no-dark-invert")

因为门是“自己糊的”，那也不可能使用现成的锁具，于是使用 Fusion 360 设计了一个齿轮配合齿条的结构，作为锁舌。只需将电机绑在齿轮上，通过旋转即可控制“锁”的开关。下面视频展示了齿轮配合齿条的运动。

{{< video video-url="http://cdn.ecwuuuuu.com/blog/media/smart-door/gear-test.mp4">}}

### 电子元件

原件部分、每组提供有一个 Arduino 板，但我们组使用了许多的元件，包括：
- 指纹模块：指纹识别开锁
- 霍尔传感器：关门检测
- 三个按钮：开关门、触发敲门检测
- RFID 读卡器：刷卡开门
- 舵机：驱动齿轮开关门

但是这些传感器大多比较复杂，需要多个针脚，于是只使用 Arduino 的话，主板上的针脚不够用。于是我们又利用了一块 [Boe-Bot](https://www.parallax.com/boe-bot-robot/) 的主板，分担控制。然后两款主板使用红外进行“交流”（因为两块主板的电压不一致，无法直接连线进行沟通）。

![两块主板示意](http://cdn.ecwuuuuu.com/blog/image/project/smart-door/two-boards-anno.jpg-compressed.webp "no-dark-invert")


## 视频演示

虽然实现的方式比较原始，但是如果住看正面，这个“智能门锁”还是比较像样的，具体演示可以看视频。

{{< video video-url="http://cdn.ecwuuuuu.com/blog/media/smart-door/smart-door-demo.mp4">}}

[^1]: [Secret Knock Detecting Door Lock](https://grathio.com/2009/11/secret_knock_detecting_door_lock/)