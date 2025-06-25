---
title: Revisit uicCourse - Shift of Development and Data Pipeline
subtitle: A development journal
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/rDuBjNdLS0M/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzUwNjI3NTg4fA&force=true&w=2400
unsplashfeatureimage: Kier in Sight Archives

publishDate: "2025-06-22T22:10:00+01:00"
lastmod: 
draft: true
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: true
math: true
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

categories:
- Tech
- Note

# type: file, link, image, and others
extramaterials:
- type: link
  name: uicCourse
  url: https://course.uichcc.app
- type: link
  name: CourseDB Vercel Site
  url: https://coursedb-beta.vercel.app

# copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## Prelude

I was self studying Django web development back in 2018 to get prepare for the development workshop course at UIC (now BNBU). During the learning process, I was quite interested in building a course information system for my university so I can easily access course information and provide a better user experience for students than looking up the course catalog PDF file.

So I started to build such a system, which I named **uicCourse**. The project was completely written in Python, using Django as the backend framework and with all web pages rendered by Django templates. The project later "donated" to UICHCC ([GitHub Repo](https://github.com/UICHCC/uicCourse)) and they keep hosting it till now.

In those 280+ commit, I managed to build a fully functional course information system, which includes:

- Course information management
- Course search
- Course quick rating
- Course review
- Major handbook
- Visualization of course data

As the codebase grew, I started to realize that the project was not well structured and my initial design (both system design and db schema) was not good enough to support future development. Especially when the frontend is becoming more complex, I started to feel the pain of using Django templates and quite native JavaScript to build the frontend.

Eventually, the project is been archived and I stopped working on it. The project is still running, but the codebase is not maintained anymore. The last commit was in 2021.

## Motivation

The story start with React. I always want to learn one of the modern frontend frameworks. I tried multiple times but I always ended up overwhelmed by the complexity of the framework and the ecosystem. And stopped by unable to solve build errors.

It all changed when coding agents become a thing. I started to use coding agents to help me write code, and I encountered any problems, I just ask the coding agent to help me solve it. By this recursive process, I finally get familiar the React and Next.js and be able to build a image application with it. (I give up on the development because I found [immich](https://immich.app), which is complete and better image management solution.)

As I become more familiar with React and Next.js, I want to revisit the uicCourse project and rewrite it with modern web development stack. The new version will be more considered in terms of architecture, design, and user experience. I want to make it more modular, more maintainable, and more user-friendly. And I do plan to maintain and run the platform in long term, so I want to make sure the codebase is well structured and easy to maintain.

## Technology Stack Choice

There is one full stack person that appear on my YouTube feed quite often, and he is [Theo](https://www.youtube.com/channel/UCbRP3c757lWg9M-U7TyEkXA). He developed T3Stack, which is a full-stack web development stack based on Next.js, TypeScript, and Tailwind CSS. I don't like start a project from scratch, so something like T3Stack can create a project with most of the boilerplate code, components linked, and configuration done for me. I can focus on the business logic and user experience.

I also uses the optional components of T3Stack, including: tRPC, Drizzle, NextAuth.js, Biome, and Shadcn UI.

| Part | uicCourse | new system |
| ---- | --------- | ---------- |
| UI | Bootstrap CSS | Tailwind CSS + Shadcn UI |
| Backend | Django | Node.js + tRPC |
| Database | SQLite/MySQL | PostgreSQL |
| Authentication | Django Auth | NextAuth.js |
| ORM | Django ORM | Drizzle |
| Deployment | Docker | Vercel + Supabase |

The new system will be a full-stack web application, with the frontend and backend separated. The frontend will be built with Next.js and Tailwind CSS, while the backend will be built with Node.js and tRPC.

The database will be PostgreSQL, which is a more powerful and scalable database than SQLite or MySQL. When developing locally, I uses docker to run the PostgreSQL database, and when deploying to production, I uses Supabase to host the database.

I use NextAuth.js for authentication, which is a modern authentication solution for Next.js applications. It supports multiple authentication providers and is easy to integrate with Next.js. I uses Discord and GitHub as the authentication providers, so users can log in with their Discord or GitHub accounts.

I uses Drizzle as the ORM, which is a modern TypeScript ORM for Node.js. It provides a simple and type-safe way to interact with the database, and it supports PostgreSQL out of the box. I uses Drizzle to define the database schema and perform database operations.

## Design and Architecture

### Database Schema

One of the main limitations of the original uicCourse project was its excessive use of foreign key relationships in the database schema. From my limited experience, I was thinking that foreign key relationships are the best way to ensure data integrity and consistency. However, this approach can lead to a complex and tightly coupled database schema, which is hard to maintain and scale. This also creates a lot of labor when populating the database with data, as I need to ensure that all foreign key relationships are satisfied (more on this later).

### APIs

The new system will use tRPC to build the APIs. tRPC is a modern RPC framework for TypeScript, which allows you to define the API schema using TypeScript types and generate the client and server code automatically. This approach can reduce the boilerplate code and ensure type safety across the frontend and backend.

### Frontend

The frontend will be built with Next.js and Tailwind CSS, which is a modern and powerful combination for building web applications. Next.js provides server-side rendering, static site generation, and API routes, which can improve the performance and SEO of the application. Tailwind CSS provides a utility-first CSS framework, which can help me build responsive and customizable UI components quickly.

Shadcn UI is a component library built on top of Tailwind CSS, which provides a set of pre-built UI components that are easy to use and customize. I will use Shadcn UI to build the UI components of the new system, which can save me a lot of time and effort.

## Data Pipeline

I have no idea of data science or data engineering, so I use very naive way to populate the database with data. I collect the data from the course catalog PDF file, and manually create it in the user interface. This is a very tedious and error-prone process. I think I spent almost a month to populate the database with data.

