# 🚀 **BlueBlog — Full-Stack Blogging Platform (Production-Ready)**

BlueBlog is a **real, production-grade blogging platform** built with a **modern full-stack architecture**, designed for **SEO, scalability, and role-based content management**.

This is **not a demo project**.
It is a **complete system** with a deployed backend, deployed frontend, authentication, media handling, SEO, and admin workflows.

---

## 🌍 Live Deployments

| Layer                    | URL                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **Frontend (Vercel)**    | [https://blueblog-frpq.vercel.app](https://blueblog-frpq.vercel.app)                   |
| **Backend API (Render)** | [https://blueblog-942c.onrender.com/api/v1](https://blueblog-942c.onrender.com/api/v1) |

---

## 📌 What This Project Solves

Most blogging projects fail because they:

- Ignore SEO fundamentals
- Have weak admin workflows
- Are frontend-only demos
- Don’t scale beyond CRUD

**BlueBlog solves that** by providing:

- SEO-first public blog
- Role-based admin dashboard
- Secure authentication
- Media management with metadata
- Clean REST API
- Production deployment

---

## 🧠 High-Level Architecture

```
User Browser
     |
     |  CDN + Edge (Vercel)
     |
Next.js Frontend (SEO + Admin)
     |
     | REST API (JWT Auth)
     |
Node.js + Express Backend
     |
PostgreSQL (Prisma ORM)
     |
Cloudinary (Image CDN)
```

---

## 🧰 Tech Stack

### Frontend

- **Next.js 14 (App Router)**
- TypeScript
- Tailwind CSS
- SEO via Metadata API
- Deployed on **Vercel**

### Backend

- **Node.js (v18+)**
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Cloudinary (Images)
- Deployed on **Render**

---

## 📂 Monorepo Structure

```
Blueblog/
├── backend/     # Express + Prisma API
└── frontend/    # Next.js App Router frontend
```

---

## 🔐 Authentication & Roles

### Roles

| Role       | Capabilities               |
| ---------- | -------------------------- |
| **ADMIN**  | Full system access         |
| **EDITOR** | Publish & manage posts     |
| **WRITER** | Create & manage own drafts |

### Auth Flow

1. User logs in
2. Access token issued
3. Refresh token stored
4. Tokens rotated securely
5. Role-based access enforced on backend + frontend

---

## 📝 Blog System (Public)

### Pages

- `/` — Home
- `/blog` — Blog listing
- `/blog/[slug]` — Blog post
- `/category/[slug]` — Category posts
- `/author/[slug]` — Author posts

### Features

- SEO-friendly URLs
- Metadata per page
- OpenGraph & Twitter cards
- Breadcrumb navigation
- Related posts
- Clean canonical links

---

## 🧑‍💼 Admin Dashboard

Located at:

```
/admin
```

### Admin Capabilities

- Post creation & editing
- Draft / publish workflow
- Category management
- Image management
- User management (ADMIN only)
- SEO fields per post

### Role-Aware UI

Sidebar and routes automatically adapt based on user role.

---

## 📸 Image Management System

Images are **first-class entities**, not just URLs.

### Image Metadata

- URL
- Alt text (SEO critical)
- Title
- Caption
- Width & height

### Flow

1. Upload image via admin
2. Stored in Cloudinary
3. Metadata stored in DB
4. Preview shown immediately
5. Reusable across posts

This avoids:

- Broken previews
- SEO-bad images
- CLS issues

---

## 🔎 SEO Implementation (Core Focus)

SEO is not optional in this project.

### Implemented

- Dynamic `<title>` and meta description
- Canonical URLs
- OpenGraph & Twitter cards
- Sitemap (`/api/sitemap`)
- Robots rules (`/api/robots`)
- Breadcrumb schema
- Clean slugs

### Rendering Strategy

| Page      | Strategy  |
| --------- | --------- |
| Blog Home | SSG / ISR |
| Blog Post | SSG / ISR |
| Category  | SSG       |
| Author    | SSG       |
| Admin     | CSR       |

---

## 🗄️ Database Design (PostgreSQL)

### Core Models

- User
- Post
- Category
- Image
- RefreshToken
- Settings

### ORM

- Prisma
- Migrations tracked
- Seed data supported

---

## 📡 Backend API

### Base URL

```
/api/v1
```

### Key Endpoints

#### Auth

```
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

#### Posts

```
GET    /posts
GET    /posts/slug/:slug
POST   /posts
PUT    /posts/:id
DELETE /posts/:id
POST   /posts/:id/publish
```

#### Images

```
POST   /images/upload
GET    /images
GET    /images/:id
PUT    /images/:id
DELETE /images/:id
```

All protected routes require:

```
Authorization: Bearer <token>
```

---

## 🚀 Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Deployment Strategy

### Frontend

- Hosted on **Vercel**
- App Router
- Environment variables via dashboard

### Backend

- Hosted on **Render**
- Built once (`npm run build`)
- Runs compiled output:

```
node dist/src/server.js
```

> Prisma migrations & seeds are run once and **not during runtime**.

---

## 🧪 Minimal Health Check

These endpoints confirm the system works:

```
GET /health
POST /auth/login
GET /auth/me
GET /posts
GET /posts/slug/:slug
```

---

## 🎯 Why This Project Is Different

This project:

- Is **actually deployed**
- Handles **real authentication**
- Solves **image SEO properly**
- Uses **App Router correctly**
- Separates **admin vs public**
- Avoids demo-project shortcuts

This is closer to a **startup-ready CMS** than a tutorial app.

---

## 📄 License

MIT License

---

## 🧑‍💻 Author

Built and engineered by **Mohammad Warish**
B.Tech CSE | Full-Stack Developer

---
