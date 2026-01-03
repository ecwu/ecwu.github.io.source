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
- Algorithm

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

## 19. 删除链表的倒数第 N 个结点

https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list

因为需要删除倒数第 n 个结点，则需要得到指向该结点前一位置的指针，然后将指针的 `next` 指向 `next.next` 位置则实现倒数第 n 个结点的删除。

而找到第 n 个结点前后指针的方法可以使用快慢指针：后指针先走 n 步，然后前指针再移动，等后指针到达链表末尾时，前指针则到达 n 结点前一位置。其中需要注意边界条件，如果后指针先移动后，已经达到链表末尾，则链表长度为1，直接返回空链表（`head.next`）。

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def removeNthFromEnd(self, head: ListNode, n: int) -> ListNode:
        p1 = p2 = head
        for _ in range(n):
            p1 = p1.next
        if not p1:
            return head.next
        while p1.next != None:
            p1 = p1.next
            p2 = p2.next
        p2.next = p2.next.next
        return head
```

因为只进行一次扫描，则时间复杂度为 $O(n)$

## 21. 合并两个有序链表

https://leetcode-cn.com/problems/merge-two-sorted-lists

主要的思路是使用两个指针指向两个升序链表中，还未加入新链表的元素。每步比较两个指向元素的大小，将较小的那个一加入新链表中。其中需要对边界条件进行处理，当一个指针指向空元素时，则直接将另一个指针指向的元素加入新链表中。

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        if not list1 and not list2:
            return list1
        if not list2:
            return list1
        elif not list1:
            return list2
        
        new_list_head = ListNode()
        new_list_p = new_list_head
        l1p = list1
        l2p = list2

        while l1p or l2p:
            try:
                if l1p.val <= l2p.val:
                    new_list_p.next = l1p
                    l1p = l1p.next
                    new_list_p = new_list_p.next
                else:
                    new_list_p.next = l2p
                    l2p = l2p.next
                    new_list_p = new_list_p.next
            except AttributeError:
                if l1p:
                    new_list_p.next = l1p
                    l1p = l1p.next
                    new_list_p = new_list_p.next
                elif l2p:
                    new_list_p.next = l2p
                    l2p = l2p.next
                    new_list_p = new_list_p.next
        return new_list_head.next
```

需要注意的是，新链表的构建，初始化了一个数值为 0 的链表节点。这个节点在最后结果中并不需要，所以在最后返回时，返回该链表头元素的下一元素 `new_list_head.next`。

时间上，只进行一次扫描，所以时间复杂度为 $O(m+n)$， $m$ 为链表1的长度， $n$ 为链表2的长度。