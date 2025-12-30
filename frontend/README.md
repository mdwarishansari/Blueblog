🌐 BlueBlog – Frontend (Next.js)

🚀 Live Website
👉 https://blueblog-frpq.vercel.app

🔗 Backend API
👉 https://blueblog-942c.onrender.com/api/v1

📌 Overview

BlueBlog Frontend is a modern, SEO-optimized blogging platform UI built with Next.js App Router.
It consumes a production-ready REST API and provides:

Public blog experience

Role-based admin dashboard

SEO, sitemap & robots support

Clean, responsive UI

Secure authentication flow

This frontend is designed for real production usage, not demo-only UI.

🧠 Tech Stack
Layer Technology
Framework Next.js 14 (App Router)
Language TypeScript
Styling Tailwind CSS
State React Context + Hooks
Auth JWT (via Backend API)
SEO Metadata API + Custom SEO
Deployment Vercel
✨ Key Features
🌍 Public Website

SEO-friendly blog pages

Category-based browsing

Author pages

Responsive design

Breadcrumb navigation

Sitemap & robots.txt

🔐 Authentication

Secure login

Token-based auth

Role-aware UI rendering

Protected admin routes

🧑‍💼 Admin Dashboard

Role-based sidebar

Post management (CRUD)

Category management

Media (image) manager

User management (Admin only)

📈 SEO & Performance

Dynamic <title> & meta tags

OpenGraph & Twitter cards

Sitemap generation

Robots rules

Clean URLs (/blog/[slug])
""
📂 Project Structure
frontend/
├── app/ # App Router pages
│ ├── admin/ # Admin panel
│ ├── blog/ # Blog pages
│ ├── category/ # Category pages
│ ├── author/ # Author pages
│ ├── api/ # sitemap & robots
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page
│
├── components/
│ ├── admin/ # Admin components
│ ├── blog/ # Blog UI components
│ ├── guards/ # Route guards
│ ├── home/ # Home sections
│ ├── layout/ # Header, Footer, AdminLayout
│ ├── seo/ # SEO & Breadcrumbs
│ └── ui/ # Reusable UI
│
├── lib/
│ ├── api/ # API clients
│ ├── context/ # AuthContext
│ ├── hooks/ # Custom hooks
│ └── utils/ # Helpers
│
├── public/ # Static assets
├── types/ # TypeScript types
└── README.md
""
🚀 Getting Started (Local)
✅ Prerequisites

Node.js v18+

Backend API running

📦 Installation
cd frontend
npm install

⚙️ Environment Variables

Create .env.local:

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

▶ Run Development Server
npm run dev

Visit:

http://localhost:3000

🔐 Authentication Flow

User logs in (/admin/login)

Backend returns access token

Token stored via AuthContext

Protected routes guarded using:

AdminPage

PublicPage

Role-based UI rendering

🛡️ Route Guards
Guard Purpose
AdminPage Protect admin routes
PublicPage Public-only pages

Used in pages like:

<AdminPage>
  <AdminLayout>{children}</AdminLayout>
</AdminPage>

🧩 Admin Roles
Role Access
ADMIN Full access
EDITOR Posts & categories
WRITER Own posts only

Sidebar auto-filters items based on role.

📝 Blog System
Pages

/ – Home

/blog – Blog listing

/blog/[slug] – Post page

/category/[slug] – Category posts

/author/[slug] – Author posts

Cards & Images

Unified BlogCard component

Fallback images supported

SEO-friendly image rendering

📸 Media Handling

Image upload via admin

Uses backend /images API

Preview + metadata

Used for:

Post banners

SEO previews

(Image preview issue scheduled for final fix)

🧠 SEO Implementation
🔍 SEO Component

Located at:

components/seo/SEO.tsx

Supports:

Title

Description

Canonical

OpenGraph

Twitter cards

JSON-LD schema

🧭 Breadcrumbs
components/seo/Breadcrumbs.tsx

Auto-generated navigation hierarchy.

🤖 Robots & Sitemap
robots.txt
/app/api/robots/route.ts

Disallows admin

Allows public content

Bot-specific rules

sitemap.xml
/app/api/sitemap/route.ts

Includes:

Home

Blog

Categories

Posts

📦 API Integration

All API calls are centralized in:

lib/api/

Example:

postApi.getAll()
categoryApi.getAll()
imageApi.upload()

Uses Axios instance with interceptors.

🎨 UI & Styling

Tailwind CSS

Responsive (mobile-first)

Dark footer / light content

Sticky header

Accessible buttons & inputs

🚀 Production Build
npm run build
npm start

🧪 Known Pending Task

📸 Image preview consistency across pages
(Already identified – final fix pending)

Everything else is complete & stable.

📄 License

MIT License

🙌 Credits

Next.js

Tailwind CSS

React Icons

Vercel

PostgreSQL Backend
