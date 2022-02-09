---
title: String
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/VQMszEo0x9c/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8Mzl8fHJvcGV8ZW58MHx8fHwxNjQzODczODk4&force=true&w=2400
unsplashfeatureimage: Nick Fewings

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

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## 3. 无重复字符的最长子串

https://leetcode-cn.com/problems/longest-substring-without-repeating-characters

给定一个字符串 `s` ，请你找出其中不含有重复字符的**最长子串**的*长度*。

这个得出的字符串中不能存在存在的字符，且返回只需要返回最长的长度，所以我们可以使用双指针，来指向不含重复字符的字串。其中：
- 右指针遍历字符串，使用一个字典来储存一个新出现字符的位置
- 如果右指针遍历的字符曾经出现过，则左指针根据下标跳转至字符上一次出现位置的下一位（保证指针区域内字符串不存在重复字符串）
- 左指针移动后，更新字典内字符的位置，以便处理下一次字符重复
- 判断左右指针框选范围字符串的长度、如果超过过去的长度，则更新。

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        appear = dict()
        l = 0
        longest = ""
        for c in range(len(s)):
            if s[c] in appear:
                if appear[s[c]] >= l:  # index not allow go backward
                    l = appear[s[c]] + 1
                appear[s[c]] = c  # update index
            else:
                appear[s[c]] = c
            if len(longest) < c+1-l:  # Update string length
                longest = s[l:c+1]
        return len(longest)
```

这种方法，主要的时间复杂度在右指针的遍历，因为右指针只遍历字符串一次，算法时间复杂度为 $\mathcal{O}(n)$, $n$ 为字符串长度。

## 5. 最长回文子串

https://leetcode-cn.com/problems/longest-palindromic-substring

回文串指从正序与倒序字串内容一致。

首先能想到一个最简单的方法是中心扩散：遍历每个字符，从每个字符的位置开始，向两侧扩散并判断字符是否一致，直到遇到不匹配。

其中，回文长度为单数和双数的情况需要分别处理。拿到回文区段后，判断长度是否是最长。

```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        start, end = 0, 0
        for i in range(len(s)):
            l1, r1 = i, i
            while l1 >= 0 and r1 < len(s) and s[l1] == s[r1]:
                l1 -= 1
                r1 += 1
            l1, r1 = l1 + 1, r1 - 1
            l2, r2 = i, i+1
            while l2 >= 0 and r2 < len(s) and s[l2] == s[r2]:
                l2 -= 1
                r2 += 1
            l2, r2 = l2 + 1, r2 - 1
            if r1 - l1 > end - start:
                start, end = l1, r1
            if r2 - l2 > end - start:
                start, end = l2, r2
        return s[start:end + 1]
```

时间复杂度为 $\mathcal{O}(n^2)$。

除了暴力解法，还有许多其他的方法，但是时间复杂度上都没有明显的优势。有一个专门针对回文字串的算法 [Manacher's Algorithm](https://en.wikipedia.org/wiki/Longest_palindromic_substring#Manacher.27s_algorithm)（~~马拉车算法~~），将时间复杂度降低到了 $\mathcal{O}(n)$，这里只讨论算法思想。

算法的做法是，维护数组 $P[]$ 用来记录字符串在 $i$ 位置为中心，存在的回文子串的个数，这个数其实也就是回文子串的“半径”。构建这个数组的方法可以根据中心扩散法的基础上修改。但是很明显，这样时间复杂度并没有下降。

Manacher 算法，充分利用了对称性，将寻找字符回文串个数的时间降到了线性。

设想一个字符串内容为 `cbacabac`, 我们记录这样一个结构。其中 T 代表的是原字符串。

```
   0  1  2  3  4  5  6  7  8
T  a  b  a  b  a  b  a  b  c
P  0  1  2  3  3  3  1  0  0
```

如位置 `4` 的字符 `a`，符合条件的子串就包括 `bab`，`ababa`，和 `bababab`，则 $P[4]=3$。

如果现在要获得位置 `6` 字符的 $P$，经过观察会发现，因为已知位置 `4` 的 $P$，位置 `6` 字符包含在位置 `4` 的回文串中。根据镜面对称的特点，对应的，位置 `2` 在位置 `4` 字符的回文串中，所能拓展的范围 (`a`) 与位置 `6` 字符在相同回文串区间 (`+`) 内的扩展的范围 (`b`) 一致（例子中为 `1-3` 和 `5-7`）。

```
   0  1  2  3  4  5  6  7  8
T  a  b  a  b  a  b  a  b  c
P  0  1  2  3  3  3  1  0  0
      -------     -------
         a           b
      ~~~~~~~~~~~~~~~~~~~
               +
```

如果位置 `2` 的回文串在 `1-3` 区间就结束了，那么位置 `6` 的回文串在 `5-7` 区间也会结束。如果没有结束，则会给位置 `6` 的中心扩散提供信息：字符串范围的**下限**是 `5-7` （至少两侧有一对回文字符）。

通过这种对称性，我们避免了不必要的重复搜索。上面的方法，在单双数长度的回文串的情况下，会有不同的结果，这时候会使用在字符间插入一个特殊字符（不存在原题中使用的字符集的字符，在英文字母的情况下，可以用 `#`）。这样所有的字符串都可以视为单数长度的字符串。还有一些细节，可见题解 [详细通俗的思路分析，多解法-windliang](https://leetcode-cn.com/problems/longest-palindromic-substring/solution/xiang-xi-tong-su-de-si-lu-fen-xi-duo-jie-fa-bao-gu/#%E8%A7%A3%E6%B3%95-5-manachers-algorithm-%E9%A9%AC%E6%8B%89%E8%BD%A6%E7%AE%97%E6%B3%95%E3%80%82)。

## 17. 电话号码的字母组合

https://leetcode-cn.com/problems/letter-combinations-of-a-phone-number

题目根据给出的数字组合，对应[九宫格输入法](https://baike.baidu.com/item/%E4%B9%9D%E5%AE%AB%E6%A0%BC%E8%BE%93%E5%85%A5%E6%B3%95)的数字英文对照。输出所有可能的字符组合。其中一种方式就是维护一个映射表，然后循环的将所有的组合输出。

```python
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        mapping = {
            '2': ['a', 'b', 'c'],
            '3': ['d', 'e', 'f'],
            '4': ['g', 'h', 'i'],
            '5': ['j', 'k', 'l'],
            '6': ['m', 'n', 'o'],
            '7': ['p', 'q', 'r', 's'],
            '8': ['t', 'u', 'v'],
            '9': ['w', 'x', 'y', 'z']
            }
        if digits == '':
            return []
        ans = ['']
        for num in digits:
            ans = [ec + ac for ec in ans for ac in mapping[num]]
        return ans
```

其中， `ans = [ec + ac for ec in ans for ac in mapping[num]] 可以展开：
```python
for num in digits:
    new_ans = list()
    for ec in ans:
        for ac in mapping[num]:
            new_ans.append(ec + ac)
    ans = new_ans
```
时间复杂度为 $\mathcal{O}(3^m\times 4^n)$，其中 $m$为映射中有三个字母的数字个数，$m$为映射中有四个字母的数字个数。
