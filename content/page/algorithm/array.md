---
title: Array
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/GsZLXA4JPcM/download?force=true&w=2400
unsplashfeatureimage: Ricardo Gomez Angel

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

## 1. 两数之和

https://leetcode-cn.com/problems/two-sum

给定一个整数数组 `nums`，目标是找出数组中的两个整数，算数和为 `target`，返回数组下标（只有一个答案，不能元素重复使用）。**其中最简单直接的方法就是暴力遍历**，得到所有二元素数组的组合（但需要注意储存下标）。

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        for i in range(len(nums)):
            for j in range(len(nums)):
                if i == j:
                    continue
                if nums[i] + nums[j] == target:
                    return [i, j]
```

但很明显，暴力遍历的时间复杂度很高，为 $\mathcal{O}(n^2)$。

另一种方式则可以使用哈希表，每次计算元素和 `target` 的差值，将差值在哈希表中寻找，如果不存在，则将元素和对应的下标存入哈希表中。这样如果遇到符合要求的组合，就能拿到对应元素的下标并返回了。

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        h_dict = dict()
        for i in range(len(nums)):
            pair_elem = target - nums[i]
            if pair_elem in h_dict.keys():
                return [i, h_dict[pair_elem]]
            else:
                h_dict[nums[i]] = i
```

这种优化的方法，因为只需要遍历一次，则时间复杂度为 $\mathcal{O}(n)$, 但需要哈希表（Python 中为字典 dict），则空间复杂度最差为 $\mathcal{O}(n)$

## 4. 寻找两个正序数组的中位数

https://leetcode-cn.com/problems/median-of-two-sorted-arrays

最暴力无脑的方法就是将两数组合并后排序，得到新数组后、根据长度、得到中心元素。最后得出中位数。

```python
class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        nums1 = sorted(nums1+nums2)
        if len(nums1) % 2 == 1:
            idx = int(len(nums1)/2)
            return nums1[idx]
        else:
            idx = int(len(nums1)/2)
            return (nums1[idx] + nums1[idx-1])/2
```

但这种方法复杂度开销主要在快速排序，为 $\mathcal{O}((m+n) \log (m+n))$。这里也可以使用归并排序之类的方法。但是这道题之所以被定义为 `困难`，是因为题目中给出的额外条件：**控制时间复杂度为 $\mathcal{O}(\log (m+n))$**。

## 11. 盛最多水的容器

https://leetcode-cn.com/problems/container-with-most-water

横坐标上有多个垂直线，寻找两根垂直线和垂直线之间距离为一个盛水的容器，使得“容器”内最大的盛水量（两垂直线较短的一条*两线距离）。这个盛水量很明显与两线中最短的线有关，所以我们可以通过更换两线中较短的那条为潜在更长的线，来避免木桶效应。最大盛水量则再每次更换垂直线后计算并比较。

```python
class Solution:
    def maxArea(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1  # Use two pointers
        ans = 0
        while l < r:
            area = min(height[l], height[r]) * (r - l)
            ans = max(area, ans)
            if height[l] < height[r]:
                l += 1
            else:
                r -= 1
        return ans
```

使用双指针来搜索，最差情况会将所有垂直线遍历一次，复杂度为 $\mathcal{O}(n)$，空间复杂度为 $\mathcal{O}(1)$。

## 15. 三数之和

https://leetcode-cn.com/problems/3sum

给整数列表，返回所有和为 0 的三元组。这里可以通过排序的方法来去除不必要的搜索。我们先锚定一个整数，然后在该整数右一和末尾位置，使用两个指针，搜索可能的组合。对于重复的整数，只对最后一个出现的整数进行搜索，这样可以避免出现重复三元组。在搜索时，如果结果大于0，则右指针左移动；反之左指针右移。当搜索到一个符合条件的三元组，则左右指针同时移动，该循环在两指针相遇时结束。

```python
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        results = list()
        if len(nums) < 3:  # no possible combo exist
            return results
        nums = sorted(nums)
        n = len(nums)
        for k in range(n):
            if nums[k] > 0:
                break
            if k > 0 and nums[k] == nums[k-1]:
                continue
            i = k + 1
            j = len(nums) - 1
            while i < j:
                sum = nums[k] + nums[i] + nums[j]
                if sum == 0:
                    results.append([nums[k], nums[i], nums[j]])
                    i += 1
                    while i < j and nums[i] == nums[i - 1]:
                        i += 1
                    j -= 1
                    while j > i and nums[j] == nums[j + 1]:
                        j -= 1
                elif sum < 0:
                    i += 1
                    while i < j and nums[i] == nums[i - 1]:
                        i += 1
                else:
                    j -= 1
                    while j > i and nums[j] == nums[j + 1]:
                        j -= 1
        return results
```

对 n 元素搜索，再使用双指针来搜索，最差情况会将所有 n 右侧元素遍历一次，复杂度为 $\mathcal{O}(n^2)$。


## 53. 最大子数组和

https://leetcode-cn.com/problems/maximum-subarray

寻找最大数组和是一道经典的的算法题，返回数组中，最大子序列的和。最暴力的思路是遍历所有的子数组和。如果使用三个指针，时间复杂度会达到$O(n^3)$。但可以通过前缀和来优化，将复杂度降至$O(n^2)$。
但这里，使用动态规划的思路。只需要遍历一次，维护前缀和（`pre`）和最大和（`max`）两个变量。在每个元素遍历时，先在“前缀和加当前元素”（`pre` + `i`）与当前元素（`i`）中取更大值作为新的前缀和（`pre`）。然后再比较目前最大值（`pre`）与全局最大和（`max`）作为新的全局最大和。

这里最重要的思路是前缀和（`pre`）：
1. 如果当前元素为正数，则新前缀和会是一个更大的数。
2. 如果当前元素为负数，一种情况是加和后，前缀大于当前元素，之后遇到更多正数元素后，子序列可能和会达到全局最大。
3. 如果当前元素为负数，另种情况是加和后新前缀小于当前元素，这情况则不需要继续考虑之前的子序列（将前缀和设为当前元素），因为在这种情况下之前的前缀和已经为负数，如果继续考虑之前的子序列，如果存在更大的子序列，则无法发现。

```python
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        _max = nums[0]
        temp = 0
        for i in nums:
            temp = max(i, temp + i)
            _max = max(_max, temp)
        return _max
```

因为只涉及一次数组遍历，时间复杂度为$O(n)$

## 136. 只出现一次的数字

https://leetcode.cn/problems/single-number/

数组中的数都是成对出现，只有一个落单。如果要找到那个只出现一次的数字，最简单粗暴的方法就是用字典记录每个数字出现的次数。这会许多额外的空间。所以这道题额外要求"算法应该具有线性时间复杂度。不使用额外空间来实现"。

这里使用的方法是位运算：利用 XOR 异或运算 `^`，异或运算具有以下特性：
- 交换律：`a ^ b ^ c <=> a ^ c ^ b`
- 任何数于 0 异或为任何数 `0 ^ n => n`
- 相同的数异或为 0  `n ^ n => 0`

那么将所有的数字异或后，得到的数字就是那个只出现了一次的数字。

个人认为这种方法如果没见过就很难想到，这类问题需要多看方法拓展知识面。

```python
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        a = 0  # extra space
        for n in nums:
            a ^= n
        return a
```

```python
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        for idx in range(1, len(nums)):
            nums[0] ^= nums[idx]  # reuse the first element i n the array
        return nums[0]
```