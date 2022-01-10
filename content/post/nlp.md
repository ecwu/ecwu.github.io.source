+++
title = "NLP related stuff"
subtitle = "Natural Language Processing"
author = "Zhenghao Wu"
math = false
hidedate = false
date = "2021-05-07T00:13:30+08:00"
hidereadtime = false
toc = false
draft = true
tags = [
    "project",
]
categories = [
    "Project",
]
menu = "main"
series = "Project"
+++

I started to learn NLP-related stuff in mid-2018. And gradually start to some serious research. My focus mainly on Natural Language Generation (NLG).

## Beginning: SemEval2019

By the end of 2018, members of the AI learning group {{% sidenote "ai-learning-group" %}}Lead by [Prof. Weifeng Su](https://dst.uic.edu.cn/en/faculty/faculty.htm#/wfsu/en){{% /sidenote %}} decide to take part in the SemEval 2019. To study and learning more about NLP. 

Our group chose task 6: Identifying and Categorizing Offensive Language in Social Media (OffensEval). Which the input text is users' tweets and we need to classify it.

There are three subtasks. Task A needs to identify the offensive language. Task B needs to categorization the offensive type. And Task C needs to identify the offensive target.

We used the BERT model, which is state-of-the-art at that time for text classification. But our experiment limit to changing the preprocessing methods and some simple ensemble (not even proper) methods. But is still fun to learn such an advanced model and some NLP methods.

> Our work was published as a paper in the NAACL 2019 Workshop: [ACL Anthology](https://www.aclweb.org/anthology/S19-2099/)

## Final Year Project: LenAtten

We proposed a novel attention-based module that can be applied to the RNN-based sequence-to-sequence Model for Fixed Length Summarization Task. The proposed method achieved good results on CNN/Daily Mail and English Gigaword Dataset.

> This work has been published at Findings of ACL 2021: [ACL Anthology](https://aclanthology.org/2021.findings-acl.31/); [Code](https://github.com/X-AISIG/LenAtten).

## MSc Independent Project: Cross-modal Dialogue Generation Project

Because of the anonymity requirement, more details will be provided once time suitable.
