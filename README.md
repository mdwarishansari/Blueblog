# 🚀 BlueBlog — Modern Blogging Platform

👉 **LIVE URL:**  
🔗 [https://blueblog-frpq.vercel.app/](https://blueblog-frpq.vercel.app/)

---

## 🧠 Project Summary

**BlueBlog** is a **production-ready, SEO-optimized blogging platform with a full CMS**, built using modern web technologies and real-world deployment practices.

It includes:

- ✅ **Public blog** (SEO-first, fast, accessible)
- ✅ **Admin CMS** (role-based, secure)
- ✅ **PostgreSQL + Prisma** data layer
- ✅ **Automated migrations & guarded seeding**
- ✅ **Serverless deployment on Vercel**
- ✅ **Cloudinary image handling**
- ✅ **Skeleton loading & performance optimizations**

This project is designed the **right way for production**, not just demos.

---

## 🧰 Tech Stack

- ⚛️ **Next.js 16 (App Router, React 19)**
- 🟦 **TypeScript**
- 🗄️ **PostgreSQL (Neon)**
- 🔺 **Prisma ORM**
- 🎨 **Tailwind CSS**
- ✍️ **Tiptap Editor**
- ☁️ **Cloudinary**
- 🔐 **JWT Authentication**
- 🚀 **Vercel (Serverless Deployment)**

---

## ✨ Key Features

### 🌐 Public Website

- SEO-optimized blog pages
- Category-based filtering
- Slug-based dynamic routing
- Fast loading with skeleton UI
- Open Graph & JSON-LD support

### 🛠️ Admin CMS

- Role-based access control
- Post CRUD (Draft / Publish)
- Bulk actions (publish, draft, delete)
- Category & image management
- Settings management
- Message inbox (Contact form)

### 🔐 Authentication & Security

- JWT access + refresh tokens
- Secure cookies
- Protected admin routes via middleware
- Permission checks on every action

---

## 🔍 SEO (First-Class Citizen)

SEO is **not an afterthought** in BlueBlog.

Implemented features:

- 🧠 Dynamic `<title>` & `<meta>` tags
- 📄 SEO title & description per post
- 🔗 Canonical URLs
- 🖼️ Open Graph images
- 📊 JSON-LD structured data
- 🗂️ Clean slugs & indexes
- ⚡ Fast server rendering

SEO helpers live in:

```

components/SEO/
├── Meta.tsx
└── JSONLD.tsx

```

## 📊 SEO & Performance Scores

BlueBlog is regularly tested using Chrome Lighthouse on the live production deployment.

The following public pages consistently achieve **near-perfect Lighthouse scores**, frequently reaching **100/100/100/100** for Performance, Accessibility, Best Practices, and SEO:

- **Home Page** — 100 / 100 / 100 / 100
- **Blog Listing Page** — 100 / 100 / 100 / 100
- **Category Pages** — 100 / 100 / 100 / 100
- **About Page** — 100 / 100 / 100 / 100
- **Contact Page** — 100 / 100 / 100 / 100

Scores are measured on the deployed Vercel production URL using both mobile and desktop audits.

---

## 🧠 Post-Level SEO Implementation

Each blog post is fully SEO-driven:

- Post **slug is generated from the SEO title**
- `<title>` tag uses the SEO title
- `<meta name="description">` uses the SEO description
- Canonical URL generated per post
- Dynamic Open Graph metadata
- JSON-LD structured data for articles

SEO changes in the CMS are reflected immediately in URLs, metadata, and search previews.

---

## 🏗️ Architecture Overview

```

Next.js App Router
├── app/
│   ├── (public)   → Blog, categories, pages
│   ├── admin      → CMS (protected)
│   ├── api        → REST API (server)
│
├── components/    → UI, skeletons, SEO
├── lib/           → Auth, Prisma, utils
├── prisma/        → Schema & migrations
├── scripts/       → Seed script

```

- Server Components for data fetching
- Client Components only where needed
- API routes colocated with app logic
- Clear separation of concerns

---

## 🗄️ Database & Prisma

### Core Models

- `User` (ADMIN / EDITOR / WRITER)
- `Post` (Draft / Published, SEO fields)
- `Category`
- `Image`
- `Setting`
- `ContactMessage`
- `RefreshToken`

### Prisma Highlights

- Strong relations & indexes
- JSON content for editor
- Safe cascading deletes
- Migration-driven schema changes

Schema location:

```

prisma/schema.prisma

```

---

## 🌱 Migrations & Seeding (Important)

### ✔️ Migrations

Handled automatically on every deploy:

```bash
npx prisma migrate deploy
```

### ✔️ Seeding (Guarded)

Seed runs **every deploy**, but exits safely if admin already exists.

Key guard in `scripts/seed.ts`:

```ts
if (adminExists) {
  console.log("Database already seeded. Skipping.");
  return;
}
```

This guarantees:

- First deploy → seed runs
- Later deploys → no duplicate data
- Safe for production

---

## 🚀 Vercel Deployment (Final Setup)

### ✅ Build Command (Required)

Set this in **Vercel → Settings → Build & Deployment**:

```bash
npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run build
```

### ✅ Environment Variables

Use **POOLED Neon URL** in Vercel:

```
DATABASE_URL=postgresql://...-pooler.neon.tech/...
```

Admin defaults:

```
ADMIN_EMAIL=admin@blog.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Blog Administrator
```

---

## 🧑‍💻 Roles & Permissions

| Role   | Capabilities                         |
| ------ | ------------------------------------ |
| ADMIN  | Full access (users, posts, settings) |
| EDITOR | Publish & manage posts               |
| WRITER | Create & manage own posts            |

Permission checks are enforced both:

- ✅ Server-side
- ✅ UI-level

Helpers live in:

```
lib/permissions.ts
```

---

## ⚡ Performance Optimizations

- Skeleton loaders (`components/skeletons`)
- Server-side rendering
- Static generation where possible
- Optimized Cloudinary images
- Indexed DB queries
- Minimal client JS

---

## ⚠️ Known Warnings (Safe to Ignore)

```
⚠ The "middleware" file convention is deprecated
```

This is a **Next.js warning**, not an error.
Migration to `proxy` can be done later.

---

## 🧪 Useful Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Prisma
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma db seed
npx prisma studio
```

---

## 🔐 Security Notes

- Never commit `.env` files
- Rotate DB credentials if exposed
- Use HTTPS only in production
- Do NOT run `prisma migrate reset` on prod

---

## ✅ Final Words

BlueBlog is **not a toy project**.

It demonstrates:

- Real CMS architecture
- Real database workflows
- Real deployment practices
- Real SEO strategy

If you understand this project fully, you are **production-ready** 🚀

```

---
```
