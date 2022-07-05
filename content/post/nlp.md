---
title: My Past NLP Projects
subtitle: Natural Language Processing
author: Zhenghao Wu
description: 
featureimage: http://cdn.ecwuuuuu.com/blog/image/misc/307-guaige.jpg
unsplashfeatureimage: 

publishDate: "2021-05-07T00:13:30+08:00"
lastmod: "2022-01-23T14:24:00+08:00"
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: false
math: false
gallery: false
showinfocard: true
enablecomment: false

series: Project
previous:
next:

confidence: 
importance: 

tags:
- NLP
- Natural Language Processing
- Classification
- Machine Learning
- Offensive Detection
- Summarization
- Text Generation
- Controllable Text Generation
- Cross Modal
- Dialogue
- Transformer
- Pre-trained Language Model

categories:
- Project

# type: file, link, image, and others
extramaterials:
- type: link
  name: "[ACL Anthology] BNU-HKBU UIC NLP Team 2 at SemEval-2019 Task 6: Detecting Offensive Language Using BERT model"
  url: https://aclanthology.org/S19-2099/
- type: link
  name: "[ACL Anthology] LenAtten: An Effective Length Controlling Unit For Text Summarization"
  url: https://aclanthology.org/2021.findings-acl.31/
- type: link
  name: "[GitHub] LenAtten"
  url: https://github.com/X-AISIG/LenAtten

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

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

## MSc Independent Project: Cross-modal Dialogue Pre-training

> Emotion-aware Multimodal Pre-training for Image-grounded Emotional Response Generation

In this work, we consider the natural situation that happens during a two-person doing conversation. Factors like facial expression, posture, and more will be considered except for the content expressed through spoken language. And usually, such non-verbal factors will convey much richer and more abstract information like emotions. Based on this nature, we proposed methods pre-training the language model to capture emotions from modals and incorporate the emotion into text generation for dialogue.

> This work has been accepted at DASFAA 2022; the article can be accessed from [Springer Link](https://link.springer.com/chapter/10.1007/978-3-031-00129-1_1).
