---
title: Layout Test
subtitle: Distill-style layout width sandbox
author: Zhenghao Wu
description:
featureimage:
unsplashfeatureimage:

publishDate: "2026-04-10T17:00:00+01:00"
draft: true
status:

showmeta: true
hidereadtime: true
toc: true
math: false
gallery: false
showinfocard: false
enablecomment: false

series:

confidence:
importance:

tags:
- layout
- theme

categories:
- Page

copyright:
---

This page is a sandbox for the Distill-style layout classes added to the theme. All breakout blocks should stay left-aligned, while each class expands further to the right.

## Reference

- `l-body`
- `l-page`
- `l-gutter`
- `l-screen`
- `l-screen-right`
- `l-body side`
- `l-page side`
- `l-screen side`

## Default Body

This paragraph uses the default article flow without any explicit layout class. It should match the normal reading width of the post body.

<section class="l-body">
  <div style="min-height: 8rem; padding: 1.25rem; background: linear-gradient(135deg, #e0f2fe, #bfdbfe); border: 1px solid #7dd3fc; border-radius: 0.75rem;">
    <strong>`l-body`</strong><br>
    Baseline body width.
  </div>
</section>

## Page

This should align to a page-width column with the same left and right outer gap.

<section class="l-page">
  <div style="min-height: 10rem; padding: 1.25rem; background: linear-gradient(135deg, #ffedd5, #fdba74); border: 1px solid #fb923c; border-radius: 0.75rem;">
    <strong>`l-page`</strong><br>
    Large breakout width.
  </div>
</section>

## Gutter

This should occupy the column between the body width and the page width. It is useful for marginal figures or supplemental blocks that should sit entirely to the right of the reading column without becoming full-page elements.

<section class="l-gutter">
  <div style="min-height: 9rem; padding: 1.25rem; background: linear-gradient(135deg, #ede9fe, #ddd6fe); border: 1px solid #8b5cf6; border-radius: 0.75rem;">
    <strong>`l-gutter`</strong><br>
    Starts at the body edge and extends to the page edge.
  </div>
</section>

## Screen

This should bleed all the way to both browser edges.

<section class="l-screen">
  <div style="min-height: 11rem; padding: 1.25rem; background: linear-gradient(135deg, #fef3c7, #f59e0b); border: 1px solid #d97706; border-radius: 0.75rem;">
    <strong>`l-screen`</strong><br>
    Extends left into the outer gutter.
  </div>
</section>

## Screen Right

This should keep the left edge aligned with the normal content start, while expanding only toward the right edge of the page content area.

<section class="l-screen-right">
  <div style="min-height: 10rem; padding: 1.25rem; background: linear-gradient(135deg, #e0f2fe, #7dd3fc); border: 1px solid #0ea5e9; border-radius: 0.75rem;">
    <strong>`l-screen-right`</strong><br>
    Expands to the right without bleeding past the left content edge.
  </div>
</section>

## Body Side

This should align a smaller block to the right edge of the body column.

The paragraph before the side block is intentionally longer so the transition from normal reading flow to the smaller anchored block is easier to judge. When this is working well, the reader should still feel that the article has a stable main column, while the side element reads as an optional companion rather than a competing main element.

<section class="l-body side">
  <div style="min-height: 8rem; padding: 1.25rem; background: linear-gradient(135deg, #ede9fe, #c4b5fd); border: 1px solid #8b5cf6; border-radius: 0.75rem;">
    <strong>`l-body side`</strong><br>
    Smaller block anchored to the body's right edge.
  </div>
</section>

This paragraph comes immediately after the `l-body side` example. It exists to make the surrounding flow easier to inspect on desktop widths. If the block feels visually attached to the right edge of the body column, rather than floating arbitrarily inside the page, then the alignment is doing the right thing.

Another paragraph continues the same section on purpose. In a real article, this would likely be explanatory prose, a transition, or a note telling the reader what to focus on. For layout testing, it simply gives the eye more text to compare against the side element's width and placement.

## Page Side

This should align a smaller block to the right edge of the page-width column.

Compared with the body variant, this one should feel more spacious. The side box is still a small element, but its anchor reference is a wider parent width. That difference is subtle in code and much more obvious in actual reading context, so this page includes a full paragraph here to make that comparison easier.

<section class="l-page side">
  <div style="min-height: 9rem; padding: 1.25rem; background: linear-gradient(135deg, #dcfce7, #86efac); border: 1px solid #22c55e; border-radius: 0.75rem;">
    <strong>`l-page side`</strong><br>
    Smaller block anchored to the page column.
  </div>
</section>

The follow-up paragraph should help answer a practical question: does this still read like a note attached to the article, or does it start to feel like a second primary column? For most blog writing, the former is preferable. If it begins to dominate, the side width should probably be reduced rather than increasing the main body width.

One more paragraph is useful here because page-width examples tend to look fine in isolation but reveal edge cases once there is enough prose around them. In particular, you can compare how much horizontal separation remains between the ordinary text measure and the wider anchor used by the side element.

## Screen Side

This should anchor a smaller block to the right half of the full-bleed area.

This last variant is the most extreme version in the current test. It is useful for checking whether screen-scale alignment still feels intentional, or whether it becomes detached from the article and starts to look like a separate banner or utility panel. That judgment is hard to make without enough surrounding prose, so this section deliberately adds more reading material.

<section class="l-screen side">
  <div style="min-height: 10rem; padding: 1.25rem; background: linear-gradient(135deg, #ecfeff, #67e8f9); border: 1px solid #06b6d4; border-radius: 0.75rem;">
    <strong>`l-screen side`</strong><br>
    Smaller block anchored to the full screen width.
  </div>
</section>

The closing paragraph after the screen-side block helps show whether the full-bleed anchor still feels related to the article's main rhythm. If this looks too disconnected, the screen-side pattern may only make sense for special cases such as large diagrams, pull quotes, or highly visual annotations.

This extra paragraph is here for the same reason as the others: layout differences often only become obvious once you can compare a side element against a few successive lines of ordinary prose. The goal of this page is not elegance but making those spacing decisions easier to judge quickly.

## Figure Shortcode Test

The figure shortcode now accepts a `class` parameter, so it can participate in the same layout system.

{{< figure src="/favicon.ico" class="l-page" title="Figure shortcode" caption="This favicon figure uses `class=\"l-page\"`." >}}

## Mixed Flow

This paragraph returns to the default text width. The idea is that wide media should not force the entire article into a wide reading measure.

Another paragraph after the breakout blocks to confirm that the reading column still returns to the normal body width.
