---
title: "How I Rebuilt a 2018 Project in 2025"
subtitle: Modern Web Development, Vibe Coding, Serverless, and Practical Data Automation
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/rDuBjNdLS0M/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzUwNjI3NTg4fA&force=true&w=2400
unsplashfeatureimage: Kier in Sight Archives

publishDate: "2025-07-05T14:10:00+01:00"
lastmod: 
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: true
math: false
gallery: false
showinfocard: true
enablecomment: true

series:
previous:
next:

confidence: 8
importance: 

tags:
- uicCourse
- Python
- Development
- Software
- Programming
- Coding Agent
- AI
- Node.js
- Next.js
- Tailwind CSS
- Shadcn UI
- Vibe Coding
- Serverless
- Vercel
- Supabase
- tRPC
- Drizzle
- NextAuth.js
- PostgreSQL
- TypeScript
- React
- Web Development
- Full Stack
- Web Framework
- Web Design

categories:
- Tech
- Note

# type: file, link, image, and others
extramaterials:
- type: link
  name: uicCourse
  url: https://course.uichcc.app
- type: link
  name: CourseDB Vercel Developement Site
  url: https://coursedb-beta.vercel.app

# copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---
## Prelude: The Django and jQuery Days

In 2018, I was self-studying the Django web framework for a college course. To apply what I was learning, I decided to build a project to solve a real problem: our school's course information system.

All official course information was contained within a single, large PDF file. And course details contains in more individual handbooks PDF files. Finding a specific course was a time-consuming process that required extensive scrolling and text searches. I believed I could create a more efficient and user-friendly solution.

This led to the creation of `uicCourse`.

![uicCourse Homepage](https://cdn.ecwuuuuu.com/blog/image/webdev-shift/uiccourse-home.webp "no-dark-invert")

It was built entirely in Python with a Django backend and server-side rendered templates. Over its development, I added numerous features:

- Advanced course search and filtering
- Course information management for admins
- A quick rating system and tag-based reviews
- Handy "major handbook" display for each major
- Data visualizations for course statistics

![uicCourse Course Page](https://cdn.ecwuuuuu.com/blog/image/webdev-shift/uiccourse-course.webp "no-dark-invert")

The project was eventually passed to a UICHCC and remains operational today, serving as a snapshot of the web development practices of that time.

However, as the project's complexity increased, its limitations became apparent. The monolithic codebase developed a complex network of dependencies. My initial database schema, with its heavy use of foreign keys, made data updates difficult. As the frontend requirements grew, the constraints of using Django templates and raw jQuery became a significant bottleneck for creating interactive elements.

I eventually archived the project, but the goal of creating a better version remained.

## Motivation: Overcoming the React Hurdle with AI Assistance

For years, learning React (or Vue) was on my to-do list, but it presented a significant hurdle. My attempts to start a project often led to a frustrating cycle of build tool errors, complex configurations, and package incompatibilities.

Then came LLM coding agents. Tools like GitHub Copilot and Cline became my 24/7 coding partner.

Large Language Models (LLMs) provided a new way to work through technical challenges. They functioned as both a mentor for explaining concepts and a pair programmer for generating code. I could describe a goal, provide an error message, or ask for an explanation, and the agent would provide step-by-step guidance.

- **For simple tasks:** It accelerated development by generating boilerplate code.
- **For complex challenges:** It clarified the reasoning behind a framework's design and explained complex concepts.

With this support, I successfully overcame the initial learning curve and built a small image management application with Next.js. This experience gave me the confidence to undertake a modern rebuild of `uicCourse`. 

{{% sidenote "iib-side-project" %}}The side project was a small image management application built with Next. I was planning to keep maintaining it, but I found out there is a better solution call [immich](https://immich.app/), so I archived it. {{% /sidenote %}}

The new project, `coursedb`, would be built with a clean architecture, an improved user experience, and a clear plan for long-term maintenance.

## The Tech Stack: From Monolith to Modern Full-Stack

The T3 Stack, created and promoted by content creator [Theo](https://www.youtube.com/@t3dotgg), heavily influenced my choice of technologies. It provides a great starting point for full-stack applications.

{{< embed-video site="youtube" id="YkOSUVzOAA4" >}}

The technological evolution from the 2018 project to the 2025 rebuild is clear:

| Component | uicCourse (2018) | coursedb (2025) | Rationale for the Change |
| :--- | :--- | :--- | :--- |
| **UI Framework** | Bootstrap CSS + jQuery | Tailwind CSS + shadcn/ui | From pre-styled components to a utility-first, highly customizable design system. But also providing a modern and unified component library. |
| **Backend** | Django (Python) | Next.js + tRPC (TypeScript) | A unified full-stack TypeScript environment for seamless front-to-back development. |
| **Database** | SQLite | PostgreSQL (on Supabase) | From a simple file-based DB to a robust, scalable, and fully managed SQL database. |
| **ORM** | Django ORM | Drizzle ORM | Moving to a lightweight, TypeScript-native ORM for end-to-end type safety. |
| **Authentication** | Django Auth | NextAuth.js | From a solid but rigid system to a flexible, provider-agnostic auth solution. |
| **Hosting** | Docker on a VPS | Vercel + Supabase | From manual server management to a fully managed, serverless infrastructure with CI/CD. |

![coursedb Homepage](https://cdn.ecwuuuuu.com/blog/image/webdev-shift/coursedb-home.webp "no-dark-invert")

This new stack represents a philosophical shift toward prioritizing developer experience (DX), type safety, and high efficiency. This allows me to focus on implementing business logic rather than configuring boilerplate.

## Design and Architecture: Lessons Learned

**Database Schema:** In `uicCourse`, I over-relied on foreign keys, believing maximal relational integrity was always best. I learned this can lead to a rigid schema that makes data imports and future migrations difficult. For `coursedb`, the schema is more modular and loosely coupled, defined with Drizzle ORM for flexibility and programmatic seeding. I also uses features from PostgreSQL, such as JSONB columns, to store complex data structures like reviews.

**API Layer:** I replaced Django's monolithic views with **tRPC**, which has been a significant improvement. Defining API procedures in TypeScript provides end-to-end type safety between the backend and frontend without requiring code generation or OpenAPI specifications. This makes the entire application feel like a single, cohesive codebase.

**Frontend:** The new UI is built with the Next.js App Router, Server Components, and Tailwind CSS. The design uses a persistent sidebar for navigation, a shift from Bootstrap's simpler layout. Using **shadcn/ui** accelerated the creation of consistent and accessible components. The developer experience is a stark contrast to the previous workflow, offering features like hot-reloading and a typed, component-based architecture.

**Authentication:** While Django's built-in auth is effective for basic needs, integrating social logins or modern protocols like OIDC can be complex. **NextAuth.js** is designed for this flexibility, integrating smoothly with Next.js and simplifying the addition of multiple authentication providers. Now I am using Discord and GitHub for authentication, which is more convenient for users. (Discord is good for development, because it allow to set multiple redirect endpoints)

**Database & ORM:** SQLite was sufficient for the original project but has performance limitations with concurrent writes. (Though it never gone popular and I never had a problem with it) **PostgreSQL** provides a high-performance and scalable solution. When developing locally, T3 stack provides a quick way to set up a PostgreSQL database with Docker. For production, I use **Supabase** for its managed PostgreSQL service, which simplifies deployment and scaling. While the Django ORM is an excellent tool, it choice **Drizzle ORM** for its lightweight, TypeScript-native design.

![coursedb Course Page](https://cdn.ecwuuuuu.com/blog/image/webdev-shift/coursedb-course.webp "no-dark-invert")

## Practical Data Automation: From Manual Entry to an Automated Pipeline

The data entry process for the 2018 project was entirely manual. I copied course data from the official PDF and entered it into the system's forms. This was a highly repetitive task that took weeks to complete, driven by a concern that batch processing might introduce errors.

My new data pipeline is now fully automated and takes minutes:

1.  **Extraction:** The source PDF is converted to raw text using the `pdftotext` utility.
2.  **Structuring:** A combination of regular expressions, custom rules is used to parse the unstructured text into organized data blocks (e.g., course codes, descriptions, prerequisites).
3.  **Refinement with AI:** This is the most innovative step. The structured data is processed by an LLM using carefully crafted prompts to perform several tasks:
  - **Normalize:** Correct capitalization in English course titles.
  - **Enrich:** Generate Chinese names based on the course description.
  - **Parse:** Convert human-readable prerequisite rules into structured JSON.
  - **Transform:** Convert nested tables of elective courses into a flat CSV format.

I now approach data handling with the same principles as coding: it is composable, iterative, and automated. This not only saves a significant amount of time but also results in richer, more accurate data.

If the data have errors, I can quickly identify and fix them in the source text, re-run the pipeline, and regenerate the entire dataset. Gradually improves the quality is quite a fun process.

## From Repetitive CRUD to Collaborative "Vibe Coding"

A large portion of the development time for the original system was spent on repetitive CRUD (Create, Read, Update, Delete) tasks. Each new feature required manually building UI forms, writing view logic, and handling validation.

My current workflow is more collaborative. And AI scientist Andrej Karpathy call it **"vibe coding"**—a process of working with an AI agent. I describe the desired functionality at a high level, and the agent scaffolds the initial implementation. For example:

> "Generate a tRPC procedure for `coursedb` to manage course reviews. It should support pagination, include user information, validate ratings are between 1 and 5, and only allow the review's author to delete it."

This produces a functional, type-safe starting point in seconds. My role shifts from writing boilerplate code to refining the logic, verifying correctness, and guiding the overall architecture. This method does not replace the developer but rather augments their capabilities.

### Which AI Coding Agent to Use?

I have used several tools. Each has its strengths and weaknesses:

- **GitHub Copilot:** Is the OG tool. At the beginning, it allow FIM (Fill In the Middle) completion, which is great for generating code snippets and completing functions. It always make latest model available to users at "day one". I remember I gain access to Gemini Pro 2.5, GPT-o3-mini, GPT-4.1, and Claude Sonnet 4 at the time these model was released. But I think the problem for Copilot is it not catch up with the latest Agent-based coding workflow. They have the mode, but it is not as good as others. Now, they start their new payment model, which allow for a limited number of requests per month. It is still a great tool for quick code generation and completion. But I think it is not the best tool for coding agent workflow.

- **Cline:** Is a coding agent plugin for VSCode that provides a more interactive experience. It have two mode: "Plan" and "Act". In both modes, it will go through the files in the current workspace and generate grounding solutions. In "Plan" mode, it generates a high-level plan for the requested feature, which is great for understanding the overall architecture. In "Act" mode, it generates code based on the plan. It is a great tool for vibe coding. When I use it, I usually uses a reasoning model like DeepSeek-R1 to generate the plan, and then use a coding model like Claude to implement the plan.

- **Claude Code** is command line tool that you call from the working directory. It need a Anthropic API key or valid Claude Pro/Max subscription. The justification for its form is everyone have their preferred IDE, so instead of building a plugin and adapting to each IDE, it is better to build a command line tool that can be used IDE-agnostic. To my surprise, it generates great code and can handle complex tasks. To be honest, all the coding agents works in a similar way, The model, the prompt, and the tooling are the key factors that determine the quality of the generated code. I can see the model output is pretty quick, and the tooling is well-designed. And because anthropic itself develops the model, it can provide a more consistent experience. I think it is a great tool for vibe coding, and I use it for most of my coding tasks. The only downside is it is pretty expensive, the price tag of Claude Sonnet 4 is 3$/15$ per million input/output tokens, which is quite high compared to other models. Some power users will use 200$+ every day. Maybe that is why a lot of people are paying for the Max x20 subscription (200$ per month).

- **Gemini CLI** pretty similiar to Claude Code, but it is a command line tool from Google for their LLM Gemini. It provides a more generous free tier, allowing for 1000 requests per day. Except for the coding agent workflow, Google also advertises its general-purpose capabilities, such help you download files from the web without writing the crawler code. It is not as powerful as Claude Code when implementing new features for coursedb, it has the potential.

> For other popular tools like Cursor, Roo Code. I tried them but not experienced them extensively. You can check out their documentation and see if they fit your workflow.

## Final Lessons and Takeaways

Revisiting this project provided technical insights and a measure of my growth as a developer.

1.  **Design for Change.** My 2018 schema was too rigid. The 2025 version prioritizes flexibility, acknowledging that requirements will evolve.
2.  **Type Safety is a Key Advantage.** The combination of TypeScript, Drizzle, and tRPC prevents entire classes of runtime errors, enabling faster and more confident development.
3.  **Automate Processes.** My initial hesitation toward automation was a major bottleneck. A well-designed script with proper validation is far more efficient and reliable than manual repetition.
4.  **The Developer's Role Remains Central.** AI coding agents are powerful tools that handle execution, but the developer is responsible for setting goals, making architectural decisions, and ensuring quality.

The journey from `uicCourse` to `coursedb` reflects the broader evolution in web development toward more automated, component-based, and efficient workflows. It has been a valuable experience, and I look forward to seeing how these tools and methodologies continue to advance.
