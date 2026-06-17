# 🚀 BlueBlog — Production-Grade Blogging Platform

> **BlueBlog** is a production-ready, SEO-optimized tech blogging platform and Content Management System (CMS). Built with Next.js 16 (App Router) and React 19, it features strict Role-Based Access Control (RBAC), media management, dynamic search filters, and an editorial lifecycle workflow.

> [!IMPORTANT]
> 🔗 **Production Live Link:** [https://blueblog-warish.vercel.app](https://blueblog-warish.vercel.app)
> 
> [![Live Site](https://img.shields.io/badge/Live_Demo-BlueBlog_Platform-0068f9?style=for-the-badge&logo=vercel&logoColor=white)](https://blueblog-warish.vercel.app)


<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2d3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-orange?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)

</div>

---

## 📚 Table of Contents

- [🌟 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
- [🧰 Tech Stack](#-tech-stack)
- [⚙️ Local Setup & Installation](#%EF%B8%8F-local-setup--installation)
- [🔐 Authentication & RBAC System](#-authentication--rbac-system)
- [🗄️ Database & Prisma Schema](#%EF%B8%8F-database--prisma-schema)
- [🌱 Seeding Guard Strategy](#-seeding-guard-strategy)
- [🖼️ Media Pipeline](#%EF%B8%8F-media-pipeline)
- [🚀 Production Deployment](#-production-deployment)
- [🔎 SEO & Performance Optimizations](#-seo--performance-optimizations)
- [🛡️ Security Architecture](#%EF%B8%8F-security-architecture)
- [🧪 Common Debugging Tips](#-common-debugging-tips)
- [🔮 Roadmap](#-roadmap)

---

## 🌟 Project Overview

BlueBlog is a fully realized, commercial-grade CMS designed to support multi-role content creation pipelines. 

Unlike basic blog templates, BlueBlog includes:
- 👤 **Role-Based Access Control (RBAC)** (Writers, Editors, Admins)
- 🔄 **Editorial review states** (`DRAFT` ➔ `VERIFICATION_PENDING` ➔ `PUBLISHED`)
- 📄 **Block-based rich-text content storage** (Prisma JSON-LD tree using Tiptap)
- 🔑 **Secure session management** (Secure, HTTP-Only cookies with rotating JWT tokens)
- ⚡ **Lighthouse Performance score targeting 100/100**

---

## ✨ Key Features

### 📰 Public-Facing Website
- **Dynamic Search & Filtering**: Client-side filtering by categories and search queries.
- **Slug-Based Routing**: Clean, semantic, and human-readable URLs for high-ranking SEO indexability.
- **Optimized Loading**: Skeleton screens and React Suspense boundaries prevent layout shifts (CLS).
- **Responsive Theme**: Tailored Tailwind CSS theme featuring responsive glassmorphism styles and color systems.

### 🛠️ CMS Admin Dashboard
- **Content Creation**: Full Tiptap editor integration with structured block generation.
- **Verification Pipeline**: Custom dashboard to submit, review, publish, or reject articles.
- **Media Upload Manager**: Integrated Cloudinary uploads with progress indicators, size validation, and asset metadata.
- **Global Configuration**: Edit site-wide branding properties (logos, headers, descriptions) dynamically.
- **User Management**: Administrative control of user accounts, bios, profiles, and role allocation.
- **Contact Inbox**: Built-in messaging center with read status indicators.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[Web Browser Client] -->|HTTP Request| Middleware[Next.js Middleware /admin/*]
    Middleware -->|Unauthenticated| Redirect[Redirect to /admin/login]
    Middleware -->|Valid Session Cookie| AppRouter[Next.js App Router]
    
    subgraph Frontend Interfaces
        Public[Public Pages / & /blog]
        CMS[Protected CMS /admin/dashboard]
        Editor[Tiptap WYSIWYG Editor]
    end
    
    AppRouter --> Public
    AppRouter --> CMS
    CMS --> Editor
    
    subgraph Backend Services
        API[API Endpoints /api/*]
        Auth[JWT Session & Cookie Helpers]
        Prisma[Prisma ORM Client]
    end
    
    Public -->|Client-side search/filters| API
    CMS -->|Zod Validated Mutation requests| API
    CMS -->|Direct Server Component Data Fetching| Prisma
    API --> Auth
    API --> Prisma
    
    subgraph Infrastructure
        DB[(PostgreSQL / Neon)]
        CDN[Cloudinary Media CDN]
    end
    
    Prisma --> DB
    API -->|Optimized Upload Stream| CDN
```

### Directory Structure

```
├── app/                      # Next.js App Router Core
│   ├── (public)/             # SEO-first blog routes and homepage
│   │   ├── about/            # About page
│   │   ├── blog/             # Blog list & single post details
│   │   ├── category/         # Browse categories & single category filter
│   │   ├── contact/          # Contact form & dynamic details
│   │   ├── layout.tsx        # Public layout wrapper
│   │   └── page.tsx          # Animated spotlight homepage
│   ├── admin/                # CMS Dashboard & login routes
│   │   ├── (protected)/      # Protected administrative dashboard pages
│   │   │   ├── account/      # Profile avatar, bio, and settings
│   │   │   ├── categories/   # Category creator & image selector
│   │   │   ├── images/       # Media library uploads with usage badges
│   │   │   ├── messages/     # Admin inbox contact reader
│   │   │   ├── posts/        # Post list, creation editor & real-time html preview
│   │   │   ├── settings/     # Site name, logo, contact settings
│   │   │   ├── users/        # User role administration
│   │   │   ├── layout.tsx    # Admin layout & dynamic sidebar
│   │   │   └── page.tsx      # Dashboard quick statistics
│   │   ├── login/            # Split-screen admin login page
│   │   └── register/         # Split-screen registration page
│   ├── api/                  # REST API Endpoints (Auth, Posts, Categories, Media, Contact)
│   ├── layout.tsx            # Global app layout & NextTheme injection
│   └── globals.css           # Custom design tokens & CSS keyframe animations
├── components/               # UI Design System Components
│   ├── admin/                # Specialized CMS controls
│   ├── blog/                 # Public blog views (TOC, Share buttons, etc.)
│   ├── skeletons/            # Shimmer placeholders preventing layout shift (CLS)
│   ├── ui/                   # Primitive UI tokens (Button, Card, Input, Modal)
│   ├── Editor.tsx            # Tiptap Rich Text & Raw HTML Source editor
│   └── CategoryCard.tsx      # Square aspect category display cards
├── lib/                      # Shared Utility Modules
│   ├── auth.ts               # JWT sign, validation, and session cookies
│   ├── cloudinary.ts         # Lazy-loaded runtime Cloudinary configuration
│   ├── prisma.ts             # Prisma ORM client singleton
│   ├── renderContent.ts      # Tiptap JSON to HTML parser utility
│   └── seo.ts                # Dynamic metadata & JSON-LD schema builder
├── prisma/                   # DB Schema & migrations
│   ├── schema.prisma         # Relational schema specifications
│   └── migrations/           # Automated SQL migration history
├── scripts/                  # TSX CLI Utilities (e.g. database seeders)
├── public/                   # Static media resources
├── styles/                   # Design token definitions
└── proxy.ts                  # Edge security route guards / middleware
```

---

## 🧰 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.1.1 (App Router) | Server-side rendering (SSR), dynamic edge routes |
| **Styling** | Tailwind CSS 4.x + PostCSS | Theme-driven variables, responsive glassmorphism |
| **Database** | PostgreSQL (Neon Database) | Relational SQL storage |
| **ORM** | Prisma Client 6.19.1 | Type-safe queries and automated schema migrations |
| **Editor** | Tiptap StarterKit 3.15.0 | Block-based rich-text content node tree |
| **Media Host**| Cloudinary CDN | Asset optimization, AVIF/WebP auto-formatting |
| **Auth** | JWT & bcryptjs | Cookie session cookies, 12 rounds password hashing |
| **Validation**| Zod 4.3.4 | API schema contract verification |

---

## ⚙️ Local Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd Blueblog
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
# Database Credentials
DATABASE_URL="postgresql://postgres:Warish%40786@localhost:5432/blueblog?schema=public"

# Auth Keys
JWT_ACCESS_SECRET="local_development_jwt_access_secret_key_32_chars_long"
JWT_REFRESH_SECRET="local_development_jwt_refresh_secret_key_32_chars_long"
ACCESS_TOKEN_EXPIRES_IN="1d"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Cloudinary CDN Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Admin Bootstrap Account
ADMIN_EMAIL="admin@blueblog.local"
ADMIN_PASSWORD="AdminPassword123!"
ADMIN_NAME="Administrator"
```

> [!TIP]
> If your local PostgreSQL password contains special characters like `@`, you must URL-encode it (e.g., `@` becomes `%40`).

### 3. Setup Database Schema & Seed Data
```bash
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔐 Authentication & RBAC System

BlueBlog protects the CMS area using Next.js edge middleware and validates role permissions on every data operation.

### Role Permissions Matrix
| Feature | Writer | Editor | Admin |
| :--- | :---: | :---: | :---: |
| Access CMS Dashboard | ✅ | ✅ | ✅ |
| Create / Edit Own Posts | ✅ | ✅ | ✅ |
| Edit Anyone's Posts | ❌ | ✅ | ✅ |
| Submit Draft for Verification | ✅ | ✅ | ✅ |
| Publish / Unpublish Posts | ❌ | ✅ | ✅ |
| Manage Categories | ❌ | ✅ | ✅ |
| View Inbox Messages | ❌ | ❌ | ✅ |
| Manage Media Storage | ❌ | ❌ | ✅ |
| Manage Users & Roles | ❌ | ❌ | ✅ |
| Site-wide Configuration | ❌ | ❌ | ✅ |

---

## 🗄️ Database & Prisma Schema

Core relational models and validation enums inside `prisma/schema.prisma`:

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

- **`User`**: Account profiles, authentication passwords, bios, and references to posts.
- **`Post`**: Title, slug, excerpt, content (stored as JSON), SEO metadata, status, author, and categories relation.
- **`Category`**: Custom tags mapped to a unique URL slug and cover image.
- **`Image`**: Cloudinary asset dimensions, URLs, alt texts, and captions.
- **`Setting`**: Dynamic key-value pairs governing global site configuration.
- **`ContactMessage`**: Stores name, email, query text, and read status.

---

## 🌱 Seeding Guard Strategy

To prevent accidental duplicate data insertion or database schema corruption on redeployments, the seed script contains an early exit validation block:

```typescript
const adminExists = await prisma.user.findFirst({
  where: { role: UserRole.ADMIN },
})

if (adminExists) {
  console.log('ℹ️ Database already seeded. Skipping seed.')
  return
}
```

---

## 🖼️ Media Pipeline

Images are optimized, processed, and validated before storage:
- **Size Limitation**: Rejects files exceeding **5MB**.
- **Type Restriction**: Validates mime types restricting uploads to JPEG/PNG formats.
- **On-the-Fly CDN Optimization**: Images are served through Cloudinary's dynamic parameter transformation:
  ```typescript
  transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  ```
  Forces CDN compression and converts images to next-generation formats (AVIF/WebP) based on client browser support.

---

## 🚀 Production Deployment

### Build Hook Command
When deploying to platforms like Vercel, use the following build command pipeline to generate types, execute migration scripts, run seeds, and compile Next.js client files:
```bash
npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run build
```

---

## 🔎 SEO & Performance Optimizations

### 🔍 Metadata Engine
- **JSON-LD Schema Integration**: Injects structural Google Search-friendly schemas (e.g. `BlogPosting` or `Article` configurations) on article pages.
- **Social Graph Engine**: Dynamic Open Graph and Twitter Card layouts generated programmatically based on the post's featured banner and custom meta descriptions.

### ⚡ Speed Optimizations
- **Suspense Boundaries**: Async database reads are wrapped in React `Suspense` loaders, serving CSS shimmers to keep Largest Contentful Paint (LCP) times minimal.
- **Database Indexing**: Performance indexes are active on frequently referenced search fields: `slug`, `status`, `publishedAt`, and `authorId`.

---

## 🛡️ Security Architecture
- **HTTP-Only Cookies**: Prevents client-side scripts from reading active access tokens (mitigates XSS).
- **Zod Data Contracts**: Validates request body, query parameters, and param paths.
- **Edge Route Guards**: Validates JWT signature at the routing middleware level.

---

## 🧪 Common Debugging Tips

### 1. Zod native enum validation error
If updating schema enums yields Zod parsing failures:
```typescript
// Correct pattern: binds the Prisma enum directly
status: z.nativeEnum(PostStatus)
```

### 2. Next.js App Router dynamic props are async
App Router parameters are async. You must await params in layout or page files:
```typescript
const { id } = await params;
```

---

## 🔮 Roadmap
- [ ] Scheduled publishing via Vercel Crons
- [x] Autosave draft functionality
- [ ] Analytics dashboard integration (Post view counters)
- [ ] Multi-tenant blog hosting configuration