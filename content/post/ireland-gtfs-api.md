---
title: 探索爱尔兰巴士实时交通数据
subtitle: 了解 GTFS 交通数据并制作一个 Telegram 机器人
author: Zhenghao Wu
description: 本文介绍了爱尔兰交通数据 API 的使用，特别是 GTFS 数据格式，并展示了如何利用这些数据创建一个 Telegram 机器人来跟踪公交路线。
featureimage: 
unsplashfeatureimage: 

publishDate: "2025-08-19T12:00:00+01:00"
lastmod: 
draft: true
status: In Progress
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: false
math: false
gallery: false
showinfocard: true
enablecomment: false

series:

confidence: likely
importance: 6

tags:
- GTFS
- Transportation
- Ireland
- Smart Cities
- Public Transport

categories:
- Note
- Tech

# type: file, link, image, and others
extramaterials:
- type: link
  name: GTFS Documentation
  url: https://developers.google.com/transit/gtfs

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

直到最近才发现[爱尔兰交通管理局](https://www.nationaltransport.ie)有一个公开的交通数据。之前我是在使用 [Transit App](https://transitapp.com/) 来查询时刻表和车辆位置（也是才知道 TFI Live 也可以看到很详细的数据），但有时候这些应用并不能完全满足我的需求（可能只是我个人想要更多的数据，但它们本身是相当不错的软件）。

所以这篇文章主要是记录探索这个 API 的过程，并介绍我是如何将它变成一个用于跟踪我常用路线的 Telegram 机器人的。

## TFI 提供了什么

数据它主要包括两个部分：GTFS 数据源和两个实时信息的 API。GTFS 数据源包含提前定义好的线路、站点和时刻表的静态信息，而 API 则提供实时车辆位置和线路到站时间的状态更新。

GTFS 的全称是 General Transit Feed Specification（通用交通数据规范），最初由 [Google](https://developers.google.com/transit/gtfs-realtime) 开发，用于共享公共交通数据。后来它发展成为一个[开放标准](https://gtfs.org/documentation/overview/)，全球许多交通机构都在使用。

严格说，提前定义好的静态数据属于 GTFS 的部分，而 API 获取的数据则属于 GTFS Realtime 的范畴。静态的 GTFS 数据可以从 [Transport for Ireland 网站](https://www.transportforireland.ie/transitData/PT_Data.html)下载，格式为 zip 文件。静态文件的更新频率不固定，建议定期获取最新的数据，以保证路线和时刻表的准确性。

## 相关项目

我首先查找了一些已经利用该 API 的现有项目。其实 GTFS 相关的项目有很多，我这边只列举专注于爱尔兰/英国交通数据的几个：

1. [seanrees/gtfs-upcoming](https://github.com/seanrees/gtfs-upcoming): 作为 GTFS-R 客户端获取数据，将数据转换为一个易用的 API，可以直接站点编号查看即将到站的车辆信息。
2. [seanblanchfield/tfi-gtfs](https://github.com/seanblanchfield/tfi-gtfs): 功能与 [seanrees/gtfs-upcoming](https://github.com/seanrees/gtfs-upcoming) 类似，优化了内存占用，实现了容器化和 Redis 缓存。
3. [jclgoodwin/bustimes.org](https://github.com/jclgoodwin/bustimes.org): 一个相当庞大的开源项目，旨在提供实时公交信息，支持多种数据源。

我最开始是基于 tfi-gtfs 来做的，想在这个基础上加入路线信息，行程信息的接口。但因为原应用呈现为一个 API，所以引入的 Flask 框架和节省内存的设计让在基础上开发变得困难。所以我在通过它了解了 GTFS 的基本结构和数据模型后，决定从头开始构建一个新的解决方案。

## GTFS 数据模型

![Class diagram of GTFS](https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/GTFS_class_diagram.svg/1920px-GTFS_class_diagram.svg.png)

如图是 GTFS 数据模型的类图，但并不是每一个类都需要关注，以下是（我的应用中）最重要的几个类：

1. **线路（Routes）**：定义了公交线路的基本信息，包括线路编号、名称、起点和终点等。
2. **站点（Stops）**：描述了公交站点的位置信息，包括站点编号、名称、经纬度等。
3. **旅程（Trips）**：表示一次完整的公交行程，包括所经过的线路、站点和时间信息。
4. **站点时间（Stop Times）**：提供了一个旅程中每个站点的到达和离开时间信息。
5. **形状（Shapes）**：描述了公交线路的空间形状，由一序列经纬度信息组成。

GTFS-R 数据中的两个都很重要：

1. **实时车辆位置（Vehicle）**：提供了每辆公交车的当前位置，和实时位置上报的时间。
2. **预计到站时间（Trip Updates）**：提供了每个旅程的最新状态，包括预计到达时间、延误信息等，可以用于实时更新公交时刻表。

如果是符合标准的 GTFS 数据，可以使用 [gtfs-realtime-bindings](https://github.com/MobilityData/gtfs-realtime-bindings) 来处理。它会根据 protobuf 定义生成相应的 Python 类，简化数据的解析和使用。

## 客户端架构和设计

因为我只需要提供实时的公交信息，那么我归纳了以下几个主要功能：

- 作为 GTFS/GTFS-R 的客户端，下载静态数据存储到本地，以及定期获取实时数据。
- 针对一个站点，获得该站点的实时到站信息，尽量与 TFI Live 的数据保持一致。
- 针对一个线路，获得该线路中当前时间附近所有旅程的状态（已完成，运行中，计划中）
- 针对一个旅程，获得该旅程的实时状态更新，包括车辆位置和预计到达时间以及接下来的站点信息。

数据量方面（截止 2025 年 8 月 23 日）：

| 类名 | 数据量 | 说明 |
| ---- | ---- | ---- |
| Routes | 433 | 线路 |
| Stops | 10456 | 站点 |
| Trips | 408525 | 行程（数十万条） |
| Stop Times | 11306094 | 站点到达时间（数千万条） |
| Shapes | 6937648 | 形状（数百万条） |
| Vehicle | 100～2000 | 车辆（随时间从数百条到两千多条） |
| Trip Updates | 10000+ | 旅程更新（数万条） |

静态数据文件是 txt 格式的，里面内容是 CSV 格式的。我选择 SQLite 作为数据库，直接通过 pandas 的 `to_sql` 方法将数据写入数据库中。为了提高查询效率，我为常用的字段添加了索引。

机器人方面，我使用了 [python-telegram-bot](https://github.com/python-telegram-bot/python-telegram-bot) 库来实现与 Telegram 的交互。通过设置 Webhook，我可以接收用户的消息并进行处理。机器人主要提供以下功能：

## Arrival（实时站牌）的实现

![爱尔兰的电子倒计时站牌](https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Sign-1040274%2C_Leixlip%2C_Co._Kildare%2C_Ireland.jpg/960px-Sign-1040274%2C_Leixlip%2C_Co._Kildare%2C_Ireland.jpg "no-dark-invert")
爱尔兰的电子倒计时站牌 CC BY-SA 4.0 Author: [Leimanbhradain](https://commons.wikimedia.org/wiki/User:Leimanbhradain)

这个功能想实现如图所示的电子倒计时站牌。因为并不是所有的站点都有电子的倒计时牌。这个站牌会显示三到四个即将到站的公交车信息，并显示预计到达时间。

下面以我常坐的站点为例，来解释算法的处理逻辑，并用于验证效果。分别是站点 UCD Belfield 768 和 Fitzwilliam Street 750。

1. 处理站点第一步是获取站点的 ID (stop_id)。站名和数字的编号并不是 stop 表的主键，我们先需要通过静态数据中的 Stops 表来获取。

- UCD Belfield 768 是 `8250DB000768`
- Fitzwilliam Street 750 是 `8220DB000750`



2. 获取到了 stop_id 后，我们首先需要获取计划的旅程，这需要联表查询。涉及 routes，trips，stop_times 三个表 （routes.stop_id -> trips.route_id，trips.trip_id -> stop_times.trip_id）。

```sql
SELECT 
    st.trip_id, st.arrival_time, st.stop_sequence, 
    t.service_id, t.trip_headsign, t.direction_id, 
    r.route_short_name, r.route_long_name, r.agency_id
FROM stop_times st
JOIN trips t ON st.trip_id = t.trip_id
JOIN routes r ON t.route_id = r.route_id
WHERE st.stop_id = ?
```

联表查询后，我们就可以获得当前站的详细行程信息，包括哪趟路线会**计划**何时在该站点停靠。

3. 接下来我们需要按日期提取执行计划（比如周日时，有一些班次不运行），这需要从 calendar 和 calendar_dates 两个表中获取。calendar 定义了常规的服务日期，而 calendar_dates 则定义了例外日期（如节假日）。我们需要根据当前日期来过滤出有效的 service_id。

Trips 表中包含 service_id 字段，那么前一步的查询结果中我们就可以进一步的过滤出有效的行程。

4. 到现在其实我们已经可以通过 arrival_time 排序并通过展示大于当前时间的到达时间来实现电子倒计时站牌的功能。但是实时的数据目前还没有用上，我们需要结合 Trip Updates 数据来实现。

先介绍一下 Trip Updates 关键的字段 (拆成两段)

| trip_id      | route_id  | schedule_relationship | direction_id |
|---------------|--------------|----------------|--------------|
| 104762_28    | 104762            | SCHEDULED    | 0              |

| stop_id | stop_sequence | arrival_delay  |
|---------|----------------|----------------|
| 15513   | 31             | 7098           |

可以看到，里面包含了一个行程在某个站点的延误时间数据，那么根据上一部得到的计划到站时间加上 arrival_delay 就可以得到该旅途到站点的预计时间。

但里面其实有个坑：这个实时数据中并不是每个站点都有对应的到达延误信息的，我这边展示 trip_id `105097_325` 的查询结果：

| stop_id | stop_sequence | arrival_delay  |
|---------|----------------|----------------|
| 3930    | 18             |                |
| 914     | 19             | 77             |
| 3615    | 23             | 42             |
| 818     | 25             | 77             |
| 814     | 29             | 105            |
| 3851    | 32             | 45             |
| 38990   | 36             | 76             |
| 1813    | 39             | 82             |
| 1722    | 41             | 13             |
| 1671    | 43             | 83             |
| 2017    | 46             | 7              |
| 38991   | 48             | 171            |

可以看到里面 stop_sequence 是不连续的，这意味着并不是所有的站点都有实时的到达延误信息。针对这个情况，我采用了以下策略：

  1. 优先使用实时数据中的到达延误信息，如果没有，则回退到计划的到达时间。
  2. 对于没有实时到达延误信息的站点，使用相邻站点的到达延误信息进行计算。

完整的获得延误估算的伪代码如下：

```pseudo
函数 获取最近的延误估算(trip_id, stop_sequence, 所有实时更新数据):
  如果实时更新数据为空:
    返回 None

  # 获取该行程所有有延误信息的更新
  trip_updates = 过滤实时更新数据，条件为 trip_id 匹配且 arrival_delay 不为空

  如果 trip_updates 为空:
    返回 None

  # 按照 stop_sequence 排序
  trip_updates = 按 stop_sequence 排序

  # 查找是否有精确匹配的 stop_sequence
  exact_match = 过滤 trip_updates，条件为 stop_sequence 等于目标 stop_sequence
  如果 exact_match 不为空:
    返回 exact_match 的第一个 arrival_delay

  # 查找最近的前后站点
  before_stops = 过滤 trip_updates，条件为 stop_sequence 小于目标 stop_sequence
  after_stops = 过滤 trip_updates，条件为 stop_sequence 大于目标 stop_sequence

  如果 before_stops 不为空:
    # 使用最近的前一个站点的延误
    返回 before_stops 的最后一个 arrival_delay

  如果 after_stops 不为空:
    # 使用最近的后一个站点的延误
    返回 after_stops 的第一个 arrival_delay

  返回 None
```

根据新的算法，结合实时数据，我们可以得到更准确的预计到达时间，从而提升电子倒计时站牌的准确性。在展示时，我们只需要再计算预计到达时间与当前时间的差值，即可实现倒计时功能。

### 效果展示

- 768 站在周日的预计到达时间，与 TFI Live 的数据对比：

![](https://cdn.ecwuuuuu.com/blog/image/tfi-test-768.jpg-compressed.webp)

可以看到结果相当接近，（机场快线 700 不是同一个数据源，所以我的结果里没有）

> 未完待续