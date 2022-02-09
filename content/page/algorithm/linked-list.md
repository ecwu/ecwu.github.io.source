---
title: Linked List
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/PDxYfXVlK2M/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8MXx8bGlua2VkfHwwfHx8fDE2NDMwNDYwMTQ&force=true&w=2400
unsplashfeatureimage: JJ Ying

publishDate: "2022-02-09T15:30:00+08:00"
lastmod: 
draft: false
status: In Progress
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: true
math: true
gallery: false
showinfocard: true
enablecomment: false

series: algorithm
previous:
next:

confidence: 
importance: 

tags:
- Placeholder

categories:
- Placeholder

# type: file, link, image, and others
extramaterials:
- type: file
  name: placeholder
  url: #

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## 2. 两数相加

https://leetcode-cn.com/problems/add-two-numbers

给两个非空链表，每个节点储存一位数字，按逆序排序。返回一个相同形式的链表，表示两个链表的和。

数据在链表中是倒序的，这非常的便于处理计算时出现的进位。那最简单的方式就是从两个链表的入口开始计算，直到两个链表走到末尾。

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        def getValue(node):
            return node.val if node != None else 0
        sep = 0
        amount = getValue(l1) + getValue(l2) + sep
        sep = int(amount / 10)
        returnList = ListNode(val=amount % 10)
        currentListPt = returnList
        while l1 != None or l2 != None:
            try:
                l1 = l1.next if l1.next else None
            except AttributeError:
                pass
            try:
                l2 = l2.next if l2.next else None
            except AttributeError:
                pass
            if l1 == None and l2 == None:
                break
            amount = getValue(l1) + getValue(l2) + sep
            sep = int(amount / 10)
            currentListPt.next = ListNode(val=amount % 10)
            currentListPt = currentListPt.next
        if sep != 0:
            currentListPt.next = ListNode(val=sep)
        return returnList
```

这种方式，LeetCode 的[官方题解](https://leetcode-cn.com/problems/add-two-numbers/solution/liang-shu-xiang-jia-by-leetcode-solution/) 称为模拟，时间复杂度受两链表长度的影响 $\mathcal{O}(\max(m,n))$ （m, n 分别为两链表的长度）。

第二种方法：递归

未完待续。