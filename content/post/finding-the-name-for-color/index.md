---
title: Finding the Name for Color
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/PtabTe6iJ_8/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8M3x8cGFudG9uZXxlbnwwfHx8fDE2NDQ4NDIwMDU&force=true&w=2400
unsplashfeatureimage: Mika Baumeister

publishDate: "2022-02-14T23:28:08+08:00"
lastmod: 
draft: true
status: In Progress
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: true
toc: true
math: true
gallery: true
showinfocard: true
enablecomment: false

series: Project
previous:
next:

confidence: likely
importance: 8

tags:
- Color
- Design
- Programming
- Art
- Color Space
- Color Differences
- Perception
- HSV
- HSL
- CIELAB
- RGB

categories:
- Programming
- Art

# type: file, link, image, and others
extramaterials:
- type: file
  name: placeholder
  url: #

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

This topic first came to my mind when I was in college as a freshman. I don't quite remember what application I am going to embed this. But the goal is clear: for color in HEX or RGB format, find a name to describe it accurately.

Recently, I saw a forum thread. A color-blind person is looking for a solution to identifying the color. I immediately recall the experience I had almost five years ago.

But after I did some prototype coding, I found the result was not as good as I expected, which drove me to learn more about the topic.

And the result is this article.

## Understand Color (1)

> We won't discuss the basal stuff. Just the numeric representation of the RGB color model. You can learn more about color @ [Wikipedia](https://en.wikipedia.org/wiki/Color)

First, we need to know how to represent a color in the computer. The RGB color model describes the color as a mixture of three primary colors: **R**ed, **G**reen, and **B**lue. Each color has an integer intensity value between 0 and 255 (0 means no such color, 255 means such color has maximum intensity). So, having these three numbers, we can indicate a color.

{{< figure
  src="https://upload.wikimedia.org/wikipedia/commons/2/28/RGB_illumination.jpg"
  class="class param"
  
  title="A representation of RGB color mixing. Projection of primary color (Red, Green, Blue) lights on a white wall show secondary colors where two overlap; the combination of all three in equal intensities makes white."
  caption="Wikimedia Commons, by"
  label="ibbcc"
  attr="User:Bb3cxv"
  attrlink="https://en.wikipedia.org/wiki/File:RGB_illumination.jpg"
  alt="alt"
 >}}
{{< section "end" >}}

In HTML, pure white color under such a model is `RGB(255,255,255)`. comma-separated values match the Red, Green, and Blue colors in order. By converting each color value from decimal to hexadecimal, we have a tidier form, `RGB(#FFFFFF)`. I provide an interactive slider below, so you play with the intensity of each primary color and see the mixing result.

{{< include-html "addition-slider.html" >}}

## Color Naming

Consider three primary colors, each with 256 different intensities. We have $255^3 = 16777216$ possible colors. But our commonsense tells us that we don't have such an enormous number of names for colors. Noteworthy that several dominant color naming schemes provide various names.

Two easy to get examples are the [X11 color names](https://en.wikipedia.org/wiki/X11_color_names) and [CSS Color Module Level 3](https://www.w3.org/TR/css-color-3/) ([Basic](https://www.w3.org/TR/css-color-3/#html4), [Extended](https://www.w3.org/TR/css-color-3/#svg-color)). Especially the CSS Color Module Level 3, which you can directly reference then when writing web pages.

A more proprietary and well known color naming system is the [PANTONE Color](https://www.pantone.com/). They put effort on standardize the color, and their color matching system are used all around the world. They started to publish their choice of "Color of the year" from 2000. The 2022 color of the year is PANTONE 17-3938 Very Peri.

{{< figure
  src="https://www.pantone.com/media/wysiwyg/color-of-the-year/2022/pantone-color-of-the-year-2022-very-peri-banner.jpg"
  class="class param"
  
  title="Pantone Color of the Year 2022: "
  label="pantone-coty"
  attr="PANTONE 17-3938 Very Peri"
  attrlink="https://www.pantone.com/color-of-the-year-2022"
  alt="alt"
 >}}
{{< section "end" >}}

In our case, we need the color name and its corresponding RGB value, so I made a Chinese color [name mapping file](https://gist.github.com/ecwu/d7534ef90c936e034c68b68281d9ad88) using [the list from Wikipedia](https://zh.wikipedia.org/wiki/%E9%A2%9C%E8%89%B2%E5%88%97%E8%A1%A8), I also made an English one which I stored [here](https://gist.github.com/ecwu/d7534ef90c936e034c68b68281d9ad88). 

> In the mapping files I create, there are 248 colors named in Chinese and 977 colors named in English. Personally, I thought some color names used in English were less intuitive. And as a native Chinese speaker, I am more familiar with those Chinese color names, So in the following examples on color naming, I will use the Chinese name mapping file (translation or description will be provided).

## Distance Between Colors
Consider the RGB color space. If we set each color intensity as the axis of the rectangular coordinates, we can form a $255^3$ size cube. Points inside the cube representing different colors (consider only the integer value).

{{< figure
  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/RGB_color_solid_cube.png/1024px-RGB_color_solid_cube.png"
  class="class param"
  
  title="The RGB color model mapped to a cube. The horizontal x-axis as red values increasing to the left, y-axis as blue increasing to the lower right and the vertical z-axis as green increasing towards the top. The origin, black is the vertex hidden from view."
  caption="Wikimedia Commons, by"
  label="colorcube"
  attr="SharkD"
  attrlink="https://commons.wikimedia.org/wiki/File:RGB_color_solid_cube.png"
  alt="alt"
 >}}
{{< section "end" >}}

When we find a name for a color, if there is no exact match in the naming mapping, we can find a similar match by calculating the "distance" and finding the color and its name with the smallest distance difference.

The distance here is the $L_2$ distance ([Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance)) for $C_1: \[R_1, G_1, B_1\]$ and $C_2: \[R_2, G_2, B_2\]$:

$$d(\[R_1, G_1, B_1\], \[R_2, G_2, B_2\]) = \sqrt{(R_1-R_2)^2+(G_1-G_2)^2+(B_1-B_2)^2}$$

So, if there is no exact match, the algorithm will traverse and calculate the distance between the query color $C_1$ all colors $C_k$ in the list and uses the color with $min(d(\[R_1, G_1, B_1\], \[R_k, G_k, B_k\]))$ as the close match.

I create these codes to do the procedure above.

```python
import pandas as pd
import math

def hex_to_rgb(hex):
    h = hex.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def calculate_distance(cor1, cor2):
    c1 = hex_to_rgb(cor1)
    c2 = hex_to_rgb(cor2)
    return math.sqrt((c1[0]-c2[0])**2+(c1[1]-c2[1])**2+(c1[2]-c2[2])**2)

def closest_n_color(c_list, candidate, n=10):
    distance_dict = dict()
    for name, _hex in c_list:
        distance_dict[name] = calculate_distance(candidate, _hex)
    return [[k, v] for k, v in sorted(distance_dict.items(), key=lambda c: c[1])][:n]

if __name__ == "__main__":
    match_list = pd.read_csv('color-name-mapping-cn.csv').values.tolist()
    source = '#FFFFFF'
    print(closest_n_color(match_list, source))
```

Use `#FFFFFF` (white) color for a try, the program return the top three matches: `[['白色 (White)', 0.0], ['雪色 (Snow White)', 7.0710678118654755], ['幽灵白 (Ghost White)', 9.899494936611665]]`. We can see that except for the exact match, the other two matches pretty much refer to the same color: White. Our little program has been working perfectly!

### Problem

I tried another color, `#6A4764`. Seeing it with my eye, the color belongs to dark magenta. But the program's result is not as close. It returns *iron-gray*, *dust gray*, and *dark rock blue*. When we look closer at the color distance. The dark magenta (`#8B008B`) has a $d = 87.46$ but the others is way less ($25.15, 34.38, 52.69$).

![Program Generated Top three matches](rgb-color-match-problem.png)
> Please hover the picture to see the original color in dark mode.

Why?

## Understand Color (2)

I visualize the named colors in 3d space. Clearly, those colors aren't uniformly distributed. Some are clustered together, and some space is rather sparse with almost no named color. This means some of the colors may not easy to describe.

![Named Colors in 3D space](color-name-cn-visual.png)
> Please hover the picture to see the original color in dark mode.

The other problem is, such RGB color model is hard to understand by human, especially when people have to manipulate the color. How to make it to some color or "more that color" (hue, satuation; not just red, greed, or blue). How to make it brighter or darker.

Instead using RGB color model, HSV color model is prefered. It is converted from the RGB color space.

{{< video video-url="https://upload.wikimedia.org/wikipedia/commons/5/59/RGB_2_HSV_conversion_with_grid.ogg" is-loop="True">}}

> Visualisation for conversion between color models RGB and HSV. video from [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?title=File%3ARGB_2_HSV_conversion_with_grid.ogg), by VerbaGleb.

As shown in the video, the original color cube of the RGB color model is converted into a cylinder object. At the cylinder's cap, we can easily see distinguishable named colors. And color at the top is the brightest, and it gets darker at the bottom. Slice out a layer of color horizontally, the color inside is more faded and the outer color is more vivid.

My verbal description of the HSV color cylinder is actually its three variables: **H**ue, **S**aturation and **V**alue (Or Brightness). Here are their definitions:

- Hue: The "attribute of a visual sensation according to which an area appears to be similar to one of the perceived colors: red, yellow, green, and blue, or to a combination of two of them".
- Saturation: The "colorfulness of a stimulus relative to its own brightness".
- Value: The "attribute of a visual sensation according to which an area appears to emit more or less light".

With the HSV color model, the color could be easily distingish with the Hue value, which you can try with the following interactive tool.

{{< include-html "hsv-slider.html" >}}

### RGB to HSV converstion

First, scale the range for $R, G, B$ to 0 and 1 by divide 255 to each color channel and get $R', G', B'$.

$$M=\max(R',G',B')$$

$$m=\min(R',G',B')$$

$$C= M - m$$

$C$ is also call [Chroma](https://en.wikipedia.org/wiki/Colorfulness#Chroma).

#### Hue

$$H=\begin{cases}
   0\degree, & \text{if } C = 0 \\\\
   60\degree\times(\frac{G'-B'}{C} \mod 6), & \text{if } M = R' \\\\
   60\degree\times(\frac{B'-R'}{C} + 2), & \text{if } M = G' \\\\
   60\degree\times(\frac{R'-G'}{C} + 4), & \text{if } M = B'
\end{cases}$$

#### Saturation
$$S=\begin{cases}
   0, & \text{if } M = 0 \\\\
   \frac{C}{M}, & \text{if } M \neq 0
\end{cases}$$

#### Lightness
$$V= M$$

## Color Distance under HSV color space



## Perceptually-uniform Color Space

The problem with RGB and HSV is it does not model the way in which humans perceive colour. Specifically, color perception is non-linear and not exactly orthogonal.

{{< video video-url="https://upload.wikimedia.org/wikipedia/commons/a/a4/SRGB_gamut_within_CIELAB_color_space_mesh.webm" is-loop="True">}}

{{< include-html "3d-color-space.html" >}}

Lab and HCL color spaces are special in that the perceived difference between two colors is proportional to their Euclidean distance in color space. This special property, called perceptual uniformity, makes them ideal for accurate visual encoding of data. In contrast, the more familiar RGB and HSV color spaces distort data when used for visualization.

### Color Distance in CIELAB Color Space

## Other Uncovered Stuffs