# 🚀 BlueBlog — Modern Blogging Platform

> ⚡ A production-ready, SEO-first blogging platform with a full CMS, role-based access control, and real-world deployment architecture.

🔗 **Live URL:** [https://blueblog-v1.vercel.app/](https://blueblog-v1.vercel.app/)

---

# 📚 Table of Contents

- 🌟 Project Overview
- ✨ Key Features
- 🏗️ Architecture
- 🧰 Tech Stack
- ⚙️ Local Setup
- 🔐 Auth & Role System
- 🗄️ Database & Prisma
- 🌱 Seeding Strategy
- 🖼️ Image Handling (Cloudinary)
- 🚀 Deployment (Vercel)
- 🔎 SEO & Performance
- 🛡 Security Model
- 🧪 Debugging & Common Issues
- 🔮 Future Roadmap

---

# 🌟 Project Overview

**BlueBlog** is not a demo project.
It is a **fully structured, production-style blogging system** with:

- 🌐 Public website (SEO optimized)
- 🛠️ Admin CMS (role-based & secure)
- 🧠 Post verification workflow
- 🗄️ PostgreSQL + Prisma ORM
- ☁️ Cloudinary media storage
- 🚀 Serverless deployment (Vercel)
- ⚡ Performance optimizations
- 🔒 JWT-based authentication
- 📊 Lighthouse-optimized pages (~100 scores)

This project follows real-world architectural patterns used in production applications.

---

# ✨ Key Features

## 🌐 Public Website

- 📰 Blog listing page
- 📂 Category filtering
- 🔗 Slug-based dynamic routing
- 📊 Structured JSON-LD data
- 🖼️ Open Graph metadata
- ⚡ Skeleton loading states
- 📱 Fully responsive design

---

## 🛠️ Admin CMS

- 📝 Create / Edit / Delete posts
- 📦 Draft → Verification → Publish workflow
- 🗂️ Category management
- 🖼️ Media management
- ⚙️ Site settings (logo, site name, description)
- 👤 Account management (name, bio, password)
- 👥 User management (Admin only)
- 📩 Contact message inbox

---

## 🧠 Editorial Workflow

Post status lifecycle:

```
DRAFT → VERIFICATION_PENDING → PUBLISHED
```

### 👤 WRITER

- Can create posts
- Can edit own posts
- Can submit for verification
- ❌ Cannot publish directly

### ✏️ EDITOR

- Can review posts
- Can publish posts
- Can manage categories

### 👑 ADMIN

- Full control
- Manage users
- Manage settings
- Publish / Delete any post

Permission enforcement is done:

- ✅ UI-level
- ✅ Server-level (mandatory validation)

---

# 🏗️ Architecture

```
Next.js App Router
├── app/
│   ├── (public)       → Blog pages
│   ├── admin          → CMS (protected)
│   ├── api            → REST API
│
├── components/        → UI, SEO, skeletons
├── lib/               → Auth, Prisma, utils
├── prisma/            → Schema & migrations
├── scripts/           → Seed script
```

### 🧩 Design Philosophy

- Server components for secure logic
- Client components only when needed
- Clear separation of UI & business logic
- API validation via Zod
- Prisma as single source of truth

---

# 🧰 Tech Stack

| Layer    | Technology                 |
| -------- | -------------------------- |
| Frontend | ⚛️ Next.js 16 (App Router) |
| Language | 🟦 TypeScript              |
| Styling  | 🎨 Tailwind CSS            |
| Database | 🗄️ PostgreSQL (Neon)       |
| ORM      | 🔺 Prisma                  |
| Editor   | ✍️ Tiptap                  |
| Media    | ☁️ Cloudinary              |
| Auth     | 🔐 JWT                     |
| Hosting  | 🚀 Vercel                  |

---

# ⚙️ Local Setup

## 1️⃣ Clone

```bash
git clone <repo>
cd blueblog
```

## 2️⃣ Install

```bash
npm install
```

## 3️⃣ Setup ENV

Create `.env`:

```env
DATABASE_URL=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## 4️⃣ Prisma

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

## 5️⃣ Run

```bash
npm run dev
```

---

# 🗄️ Database & Prisma

## 🔹 Core Models

- `User`
- `Post`
- `Category`
- `Image`
- `Setting`
- `ContactMessage`
- `RefreshToken`

## 🔹 Enums

```prisma
enum UserRole {
  ADMIN
  EDITOR
  WRITER
}

enum PostStatus {
  DRAFT
  VERIFICATION_PENDING
  PUBLISHED
}
```

### 💡 Best Practice Used

Instead of hardcoding Zod enum:

```ts
z.nativeEnum(PostStatus);
```

Prevents schema mismatch bugs.

---

# 🌱 Seeding Strategy (Production Safe)

Seed script includes guard:

```ts
if (adminExists) {
  console.log("Database already seeded. Skipping.");
  return;
}
```

### ✅ First Deploy

Creates admin + base data

### ✅ Future Deploys

Skips safely (no duplicate data)

---

# 🖼️ Image Handling (Cloudinary)

- Client-side image compression
- JPG / PNG validation
- 5MB limit
- Upload progress bar
- Replace / Remove image support
- Image metadata (alt, title, caption)

---

# 🚀 Vercel Deployment

### Required Build Command

```bash
npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run build
```

### Production Notes

- Use Neon pooled DB URL
- Never expose secrets
- Set environment variables in Vercel dashboard

---

# 🔎 SEO & Performance

SEO is first-class citizen in BlueBlog.

## 🧠 Post-Level SEO

- SEO Title
- Meta Description
- Canonical URL
- Open Graph
- JSON-LD structured data
- Slug derived from SEO title

---

## 📊 Lighthouse Scores

Public pages consistently score:

- ⚡ Performance: ~100
- ♿ Accessibility: ~100
- ✅ Best Practices: ~100
- 🔍 SEO: ~100

Tested on production build.

---

# ⚡ Performance Optimizations

- Server-side rendering
- Skeleton loading components
- Indexed Prisma queries
- Optimized Cloudinary images
- Minimal client-side JS
- Dynamic rendering only where needed

---

# 🔐 Security Model

- JWT authentication
- Secure cookies
- Protected admin routes
- Server-side role validation
- Zod payload validation
- Enum validation via Prisma

Never trust client input.

---

# 🧪 Common Issues & Fixes

### ❗ Zod status error

Cause:

```
Invalid option: expected DRAFT | PUBLISHED
```

Fix:

```
z.nativeEnum(PostStatus)
```

---

### ❗ params.id undefined

Fix:

```ts
const { id } = await params;
```

(App Router dynamic param is async)

---

### ❗ Role undefined in client

Fix:
Pass role from server wrapper:

```tsx
<EditPostClient userRole={user.role} />
```

---

# 🔮 Future Roadmap

- 📅 Scheduled publishing
- 📝 Autosave drafts
- 📊 Analytics dashboard
- 🧾 Audit logs
- 🔔 Notifications
- 🌍 Multi-tenant blog support

---

# 🏁 Final Notes

BlueBlog is:

- 🏗️ Architected like a real SaaS system
- 🔐 Secure
- 🚀 Deployable
- 🧠 SEO-driven
- 📦 Database-structured
- 👥 Role-based
- 📊 Performance-optimized

It demonstrates:

- Full-stack architecture
- Production-level patterns
- Real-world deployment strategy
- ORM + migrations + guarded seeding
- Role-based CMS workflow
- Advanced SEO implementation

---

## 💡 This is not a small CRUD project.

It is a structured, production-capable, scalable blogging platform.

---
