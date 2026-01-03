---
title: Sigmoid or Softmax for Binary Classification
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/FWCjJ7VNm-k/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzIzMDQ0MTUyfA&force=true&w=2400
unsplashfeatureimage: David Talley

publishDate: "2021-06-07T13:06:14+08:00"
lastmod: 
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: true
toc: false
math: true
gallery: false
showinfocard: true
enablecomment: false

series: Machine Learning

confidence: certain
importance: 8

tags:
- Machine Learning
- Classification
- Softmax
- Sigmoid
- Activation Function

categories:
- Machine Learning

# type: file, link, image, and others
extramaterials:

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

Recently, been asked a question on using neural networks for binary classification.

> The output layer of the network can be ... **One output neuron with sigmoid activation function** or **Two neurons and then apply a softmax activation function**. But what is the difference between these two?

Let start with the equations of the two functions.

Sigmoid Activation Function
$$
S(x) = \frac{1}{ 1+e^{-x}}
$$

We input the value of the last layer $x$, and we can get a value in the range 0 to 1 as shown in the figure. If the value is greater than 0.5, we consider the model output as one class, or the other class if the value is less than 0.5.{{< figure
  src="https://upload.wikimedia.org/wikipedia/commons/8/88/Logistic-curve.svg"
  class="class param"
  type="margin"
  label="sigmoid-graph"
  title="The logistic sigmoid function"
  attr="Wikimedia Commons"
  attrlink="https://upload.wikimedia.org/wikipedia/commons/8/88/Logistic-curve.svg"
 >}}

Softmax Activation Function
$$
\sigma(z)_i = \frac{e^{z_i}}{ \sum\_{j=1}^K e^{z_j}}
$$

Softmax usually use on multi-classes classification. We have multiple output neurons, and each one represents one class. With the values of these neurons as input. We can get the probabilities of each class. The sum of the probabilities is equal to 1. After give such probabilities distribution of the classes, we then use Argmax{{% sidenote "argmax-explain" %}}Argmax: The operation that finds the argument with maximum value. Usually for finding the class with the largest probability.{{% /sidenote %}} to get the model output.

## Comparison

From a mathematical point of view, these two methods are the same.

$$
\frac{1}{ 1+e^{-x}} = \frac{1}{ 1+\frac{1}{e^{x}}}  = \frac{1}{\frac{e^{x}+1}{e^{x}}} = \frac{e^{x}}{1+e^{x}} = \frac{e^{x}}{e^0+e^{x}}
$$

We can transform the sigmoid function into softmax form{{% sidenote "sigmoid-softmax-convert" %}}Retrived from: [Neural Network: For Binary Classification use 1 or 2 output neurons?](https://stats.stackexchange.com/a/207067/302706){{% /sidenote %}}. So sigmoid activation can consider as a special case of softmax activation with one of the two nodes have no weight given to it (just one node is working).

From the architectural point of view, they are clearly different. Although there is no empirical result to show which one is better. It is clear to show that if the softmax way is chosen, the model will have more parameters that need to learn. So I think that is why people usually use one output neuron and the sigmoid activation function for binary classification.

## Reference:
1. https://stats.stackexchange.com/questions/207049/neural-network-for-binary-classification-use-1-or-2-output-neurons
2. https://machinelearningmastery.com/argmax-in-machine-learning/
3. https://stats.stackexchange.com/questions/485551/1-neuron-bce-loss-vs-2-neurons-ce-loss
4. https://stats.stackexchange.com/questions/233658/softmax-vs-sigmoid-function-in-logistic-classifier