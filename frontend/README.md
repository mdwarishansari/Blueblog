# 🌐 **BlueBlog – Frontend (Next.js)**

A **production-ready**, SEO-optimized blogging platform frontend built with **Next.js App Router**, designed for **real-world usage**, not demos.

---

## 🚀 Live Links

- 🌍 **Frontend (Vercel)**
  👉 [https://blueblog-frpq.vercel.app](https://blueblog-frpq.vercel.app)

- 🔗 **Backend API (Render)**
  👉 [https://blueblog-942c.onrender.com/api/v1](https://blueblog-942c.onrender.com/api/v1)

---

## 📌 Overview

**BlueBlog Frontend** delivers a modern blogging experience with a clean UI, strong SEO foundation, and a fully role-aware admin dashboard.

It consumes a **production REST API** and provides:

- 🌍 Public blog experience
- 🧑‍💼 Role-based admin dashboard
- 🔐 Secure authentication flow
- 📈 SEO, sitemap & robots support
- 🎯 Clean, responsive UI

> This project is built for **real deployment**, not as a UI-only prototype.

---

## 🧠 Tech Stack

| Layer      | Technology                |
| ---------- | ------------------------- |
| Framework  | Next.js 14 (App Router)   |
| Language   | TypeScript                |
| Styling    | Tailwind CSS              |
| State      | React Context + Hooks     |
| Auth       | JWT (via Backend API)     |
| SEO        | Metadata API + Custom SEO |
| Deployment | Vercel                    |

---

## ✨ Key Features

### 🌍 Public Website

- SEO-friendly blog pages
- Category-based browsing
- Author pages
- Responsive design
- Breadcrumb navigation
- Sitemap & robots.txt

---

### 🔐 Authentication

- Secure login flow
- Token-based authentication
- Role-aware UI rendering
- Protected admin routes

---

### 🧑‍💼 Admin Dashboard

- Role-based sidebar
- Post management (CRUD)
- Category management
- Media (image) manager
- User management (**Admin only**)

---

### 📈 SEO & Performance

- Dynamic `<title>` & meta tags
- OpenGraph & Twitter cards
- Sitemap generation
- Robots rules
- Clean URLs (`/blog/[slug]`)

---

## 📂 Project Structure

```
frontend/
├── app/                     # App Router pages
│   ├── admin/               # Admin panel
│   ├── blog/                # Blog pages
│   ├── category/            # Category pages
│   ├── author/              # Author pages
│   ├── api/                 # sitemap & robots
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
│
├── components/
│   ├── admin/               # Admin components
│   ├── blog/                # Blog UI components
│   ├── guards/              # Route guards
│   ├── home/                # Home sections
│   ├── layout/              # Header, Footer, AdminLayout
│   ├── seo/                 # SEO & Breadcrumbs
│   └── ui/                  # Reusable UI
│
├── lib/
│   ├── api/                 # API clients
│   ├── context/             # AuthContext
│   ├── hooks/               # Custom hooks
│   └── utils/               # Helpers
│
├── public/                  # Static assets
├── types/                   # TypeScript types
└── README.md
```

---

## 🚀 Getting Started (Local)

### ✅ Prerequisites

- Node.js **v18+**
- Backend API running

---

### 📦 Installation

```bash
cd frontend
npm install
```

---

### ⚙️ Environment Variables

Create **`.env.local`**:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Site Configuration
NEXT_PUBLIC_SITE_NAME="BlueBlog"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_DESCRIPTION="A modern, SEO-optimized blogging platform"

# SEO Defaults
NEXT_PUBLIC_DEFAULT_OG_IMAGE=/og-default.png
NEXT_PUBLIC_TWITTER_HANDLE=@techblog

# Admin
NEXT_PUBLIC_ADMIN_PATH=/admin
```

---

### ▶ Run Development Server

```bash
npm run dev
```

Visit:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication Flow

1. User logs in at `/admin/login`
2. Backend returns **JWT access token**
3. Token stored via **AuthContext**
4. Routes protected using guards:
   - `AdminPage`
   - `PublicPage`

5. UI renders based on **user role**

---

## 🛡️ Route Guards

| Guard      | Purpose              |
| ---------- | -------------------- |
| AdminPage  | Protect admin routes |
| PublicPage | Public-only pages    |

Usage example:

```tsx
<AdminPage>
  <AdminLayout>{children}</AdminLayout>
</AdminPage>
```

---

## 🧩 Admin Roles

| Role   | Access             |
| ------ | ------------------ |
| ADMIN  | Full access        |
| EDITOR | Posts & categories |
| WRITER | Own posts only     |

📌 Sidebar automatically filters items based on role.

---

## 📝 Blog System

### Pages

- `/` – Home
- `/blog` – Blog listing
- `/blog/[slug]` – Post page
- `/category/[slug]` – Category posts
- `/author/[slug]` – Author posts

---

### Cards & Images

- Unified `BlogCard` component
- Fallback images supported
- SEO-friendly image rendering

---

## 📸 Media Handling

- Image upload via admin panel
- Uses backend `/images` API
- Preview + metadata support

Used for:

- Post banners
- SEO previews

📌 **Note:** Image preview consistency fix is pending (final task).

---

## 🧠 SEO Implementation

### 🔍 SEO Component

**Location:** `components/seo/SEO.tsx`

Supports:

- Title
- Description
- Canonical
- OpenGraph
- Twitter cards
- JSON-LD schema

---

### 🧭 Breadcrumbs

**Location:** `components/seo/Breadcrumbs.tsx`
Automatically generates navigation hierarchy.

---

### 🤖 Robots & Sitemap

#### `robots.txt`

`/app/api/robots/route.ts`

- Disallows admin routes
- Allows public content
- Bot-specific rules

#### `sitemap.xml`

`/app/api/sitemap/route.ts`
Includes:

- Home
- Blog
- Categories
- Posts

---

## 📦 API Integration

All API calls are centralized in:

```
lib/api/
```

Examples:

```ts
postApi.getAll();
categoryApi.getAll();
imageApi.upload();
```

- Axios instance with interceptors
- Token injection & error handling

---

## 🎨 UI & Styling

- Tailwind CSS
- Mobile-first responsive design
- Light content with dark footer
- Sticky header
- Accessible buttons & inputs

---

## 🚀 Production Build

```bash
npm run build
npm start
```

---

## 📄 License

**MIT License**

---

## 🙌 Credits

- Next.js
- Tailwind CSS
- React Icons
- Vercel
- PostgreSQL Backend
