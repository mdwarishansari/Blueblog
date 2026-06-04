# 🚀 BlueBlog — Deep-Dive Project Architecture & Specification

This document provides a highly detailed technical specification of the **BlueBlog** blogging platform. It is structured to serve as a complete reference for technical presentations (PPTs), system design reviews, or onboarding sessions.

---

## 📚 1. System Overview & Architecture

BlueBlog is a production-ready, full-stack Content Management System (CMS) and public blogging application built with the Next.js App Router. It is designed to be SEO-first, fast (targeting 100/100 Lighthouse scores), and secure, incorporating strict Role-Based Access Control (RBAC).

```mermaid
graph TD
    Client[Web Browser Client] -->|HTTP Request| Middleware[Next.js Middleware /admin/protected]
    Middleware -->|No Auth Cookie| Redirect[Redirect to /admin/login]
    Middleware -->|Valid Auth Cookie| AppRouter[Next.js App Router]
    
    subgraph Frontend Pages / Components
        Public[Public Pages / & /blog]
        Protected[Protected CMS Pages /admin/dashboard]
        Editor[Tiptap Rich-Text Editor]
    end
    
    AppRouter --> Public
    AppRouter --> Protected
    
    subgraph Backend Logic
        API[Next.js API Routes /api/*]
        Auth[Custom JWT & Cookie Helpers]
        Prisma[Prisma Client ORM]
    end
    
    Public -->|Client-side search/filters| API
    Protected -->|CRUD Requests / Zod Validation| API
    Protected -->|Direct Database Reads| Prisma
    API --> Auth
    API --> Prisma
    
    subgraph Third-Party integrations
        Database[(PostgreSQL / Neon)]
        Cloudinary[Cloudinary Cloud Storage]
    end
    
    Prisma --> Database
    API -->|Upload Stream| Cloudinary
```

### Key Architectural Choices:
*   **Next.js App Router (React 19 & Next.js 16)**: Utilizes Server Components for data fetching (eliminating API calls from server to database) and Client Components only for rich interactions (e.g., Tiptap editor, filters, modals).
*   **Prisma Client (PostgreSQL)**: Serves as the database interface, providing type safety and robust relation mapping.
*   **JSON-based Content Storage**: The Tiptap editor outputs structured JSON instead of raw HTML, which is stored in PostgreSQL and rendered dynamically to improve SEO capabilities and block rendering options.
*   **JWT Cookie-Based Session Management**: Access and Refresh tokens are issued via HTTP-only, secure cookies, preventing XSS and CSRF token extraction.

---

## 🧰 2. Technology Stack & Dependencies

The project is built using modern full-stack technologies with an emphasis on low bundle sizes and robust type-safety:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.1.1 (App Router) | Server-side rendering (SSR), API routes, static site generation, layouts |
| **Language** | TypeScript 5.x | Developer productivity and compile-time type-safety |
| **Styling** | Tailwind CSS 4.1.18 + PostCSS | Utility-first CSS, modern HSL design system |
| **Database ORM**| Prisma 6.19.1 | Schema definition, SQL migrations, database seed scripting |
| **Database** | PostgreSQL (Neon Database) | Relational storage with connection pooling support |
| **Rich Editor** | Tiptap StarterKit 3.15.0 | Block-based rich text editor component for CMS posts |
| **Media Host** | Cloudinary 2.8.0 | Image hosting, storage, auto-resizing, and optimization |
| **Authentication**| JWT (jsonwebtoken) & bcryptjs | Secure JWT signing, hashing passwords with 12 rounds |
| **Validation** | Zod 4.3.4 | Schema validation for all REST API endpoints |
| **Animations** | Framer Motion 12.23.26 | Subtle micro-interactions, sidebar transitions, page fades |

---

## 🗄️ 3. Database Schema Spec (Prisma Model)

The database schema utilizes relational integrity and indexes optimized for read-heavy operations:

### Enums
*   `UserRole`: `ADMIN` | `EDITOR` | `WRITER`
*   `PostStatus`: `DRAFT` | `VERIFICATION_PENDING` | `PUBLISHED`

### Database Entities & Relationships
1.  **User Model (`users`)**:
    *   `id` (UUID, Primary Key)
    *   `name` (String)
    *   `email` (String, Unique)
    *   `passwordHash` (String, mapped to `password_hash` in DB)
    *   `role` (`UserRole`, defaults to `WRITER`)
    *   `bio` (Nullable String)
    *   `profileImage` (Nullable String)
    *   `posts` (1-to-many relationship with `Post`)
    *   `refreshTokens` (1-to-many relationship with `RefreshToken`)
    *   `createdAt` & `updatedAt`
2.  **Post Model (`posts`)**:
    *   `id` (UUID, Primary Key)
    *   `title` (String)
    *   `slug` (String, Unique, Indexed)
    *   `excerpt` (Nullable String)
    *   `content` (Json format - TipTap document tree)
    *   `bannerImageId` (Nullable UUID, foreign key referencing `Image`)
    *   `authorId` (UUID, foreign key referencing `User`, Cascade delete)
    *   `status` (`PostStatus`, defaults to `DRAFT`, Indexed)
    *   `seoTitle` (Nullable String)
    *   `seoDescription` (Nullable String)
    *   `canonicalUrl` (Nullable String)
    *   `publishedAt` (Nullable DateTime, Indexed)
    *   `categories` (Many-to-many relationship with `Category` via join table `CategoryToPost`)
3.  **Category Model (`categories`)**:
    *   `id` (UUID, Primary Key)
    *   `name` (String)
    *   `slug` (String, Unique)
    *   `imageId` (Nullable UUID, referencing `Image`)
    *   `posts` (Many-to-many relation with `Post`)
4.  **Image Model (`images`)**:
    *   `id` (UUID, Primary Key)
    *   `url` (String - Cloudinary URL)
    *   `altText` (Nullable String)
    *   `title` (Nullable String)
    *   `caption` (Nullable String)
    *   `width` & `height` (Nullable Integers)
5.  **RefreshToken Model (`refresh_tokens`)**:
    *   `id` (UUID, Primary Key)
    *   `token` (String, Unique)
    *   `expiresAt` (DateTime)
    *   `userId` (UUID, references `User`, Cascade delete)
6.  **Setting Model (`settings`)**:
    *   `id` (UUID, Primary Key)
    *   `key` (String, Unique)
    *   `value` (String)
7.  **ContactMessage Model (`contact_messages`)**:
    *   `id` (UUID, Primary Key)
    *   `name`, `email`, `message` (Strings)
    *   `isRead` (Boolean, defaults to `false`)

---

## 🔐 4. Authentication, Authorization & Roles

Authentication is designed with security-first principles to prevent session-hijacking and unauthorized administration updates:

```
[User Login] ──> Verifies hash ──> Signs:
                                   ├── Access Token (24 hours expiration)
                                   └── Refresh Token (7 days expiration)
                                          │
                                          └── Stored in Database (refresh_tokens table)
                                          └── Saved as HTTP-Only, Lax, Secure Cookies
```

### 👤 Role-Based Access Control (RBAC) Permissions Matrix
Permissions are resolved via server-side mapping in [permissions.ts](file:///home/md-warish-ansari/Projects/Blueblog/lib/permissions.ts):

| Action | WRITER | EDITOR | ADMIN |
| :--- | :---: | :---: | :---: |
| **Access CMS Dashboard** | ✅ | ✅ | ✅ |
| **Create/Edit Own Posts** | ✅ | ✅ | ✅ |
| **Edit Anyone's Posts** | ❌ | ✅ | ✅ |
| **Submit Draft for Verification** | ✅ | ✅ | ✅ |
| **Publish Posts** | ❌ | ✅ | ✅ |
| **Manage Categories** | ❌ | ✅ | ✅ |
| **View Inbox Messages** | ❌ | ✅ | ✅ |
| **Manage Media Storage** | ✅ | ✅ | ✅ |
| **Manage Users** | ❌ | ❌ | ✅ |
| **Update Site-wide Settings** | ❌ | ❌ | ✅ |

### 🛠️ Permission Enforcement System:
1.  **Middleware Boundary**: Next.js middleware guards `/admin/:path*` (except `/admin/login`). If the `access_token` cookie is absent, the user is redirected to the login page immediately on the edge.
2.  **API Handler Guards**: Inside protected API handlers, the helper `requireAuth(allowedRoles)` is invoked:
    ```typescript
    const user = await requireAuth(['ADMIN', 'EDITOR']);
    ```
    This verifies the JWT token signature and queries the database. If a user's role is not within the whitelist, it returns a `403 Forbidden` response.
3.  **Data-level ownership check**: Writers can edit posts, but the server verifies if the post's `authorId` matches the authenticated `userId` before completing database updates. Admins and Editors skip this ownership constraint.

---

## 🧠 5. Editorial & Publishing Workflow

To maintain quality control, the platform enforces an editorial lifecycle path:

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Post Created (Writer/Editor/Admin)
    DRAFT --> VERIFICATION_PENDING : Submitted for verification (Writer)
    DRAFT --> PUBLISHED : Directly Published (Editor/Admin)
    VERIFICATION_PENDING --> PUBLISHED : Approved & Published (Editor/Admin)
    VERIFICATION_PENDING --> DRAFT : Rejected / Sent back for edits (Editor/Admin)
    PUBLISHED --> DRAFT : Un-published (Editor/Admin)
```

1.  **Creation**: A post starts in the `DRAFT` state.
2.  **Verification**: Writers submit drafts when ready. The state changes to `VERIFICATION_PENDING`. Writers can no longer edit the post while it's pending unless it's rejected back to a `DRAFT` state.
3.  **Publishing**: Editors or Admins review pending posts. They can either publish it directly (changing the status to `PUBLISHED` and setting `publishedAt` timestamp) or reject it back to the writer.

---

## 🖼️ 6. Cloudinary Media Management

The media system uses Cloudinary's Node.js SDK and REST endpoints for secure uploads.

*   **Size Constraint**: A client-side size check restricts uploads exceeding **5MB**.
*   **File Restrictions**: Only `image/jpeg` and `image/png` formats are accepted.
*   **Compression & Optimization Pipeline**:
    *   Uploads are processed via `upload_stream` using buffer manipulation.
    *   The transformation config dynamically enforces optimization:
        ```typescript
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        ```
    *   This forces Cloudinary to compression-resize the image and serve it in next-gen formats (WebP/AVIF) depending on user browser support.
*   **Rich Metadata**: Images are saved in the database with editable `altText`, `title`, and `caption` fields to ensure screen-reader accessibility and SEO keyword density.

---

## 🔎 7. SEO & Performance Optimizations

BlueBlog's layout structure was developed to reach perfect Lighthouse Core Web Vital rankings:

### ⚡ Performance Techniques
*   **Suspense Borders & Skeleton Screens**: Time-consuming queries (like fetching posts or listing categories) are wrapped in React `Suspense` containers. While the database is query-loading, visually identical Skeleton loaders are rendered, ensuring zero-latency content shifting and keeping Largest Contentful Paint (LCP) times minimal.
*   **Indexed DB Queries**: Database queries are speed-optimized at the Prisma level. Indexes are set up for `slug`, `status`, `publishedAt`, and `authorId` to ensure rapid queries even with thousands of database rows.
*   **Image Dimension Preservation**: Next.js `<Image>` component is used for banner renders, which enforces height/width ratios to eliminate Cumulative Layout Shift (CLS).

### 🔍 Search Engine Optimization (SEO) Spec
*   **Post-level Customization**: Content creators can write specific SEO Titles, Meta Descriptions, and select custom Canonical URLs that differ from the post's public title/excerpt.
*   **Open Graph & Twitter Cards**: Dynamic Open Graph images, descriptions, page types (`article` or `website`), and social creator tags are generated for all public posts.
*   **JSON-LD Structured Data**: Every article injects a JSON-LD script (Schema.org `BlogPosting` or `Article` context) containing the heading, publication date, author details, and publisher organizational details:
    ```json
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "Welcome to BlueBlog",
      "datePublished": "2026-05-29T14:50:00Z",
      "author": {
        "@type": "Person",
        "name": "Blog Administrator"
      }
    }
    ```

---

## 🎨 8. Premium UI Theme & Styling Tokens

Styling utilizes Tailwind CSS 4.x. CSS variables are defined in [globals.css](file:///home/md-warish-ansari/Projects/Blueblog/app/globals.css):

### Color System & Surfaces
*   `--bg`: `#f7fafc` (Soft, neutral site background)
*   `--fg`: `#0f172a` (Slate-900 typography color)
*   `--card`: `#ffffff` (Pure white base card surfaces)
*   `--border`: `#e6eef8` (Subtle sky-blue borders)
*   **Accent Gradient Range**: `--accent-start: #6366f1` (Indigo-500) ➔ `--accent-mid: #8b5cf6` (Violet-500) ➔ `--accent-end: #ec4899` (Pink-500).

### Custom Visual Classes
*   `elev-sm`, `elev-md`, `elev-lg`: Shadow elevation system for cards and components.
*   `glass-card` / `glass-card-dark`: Backdrop filter glassmorphism (16px blur, semi-transparent background).
*   `hover-glow`: Interactive styling that adds indigo/pink box shadows on elements when hovered.
*   `card-shine`: Shimmer sweep overlay that triggers on hover to simulate premium texture.
*   `stagger-1` to `stagger-6`: Pre-defined transition delay classes using a custom ease function (`cubic-bezier(0.16, 1, 0.3, 1)`) to stagger loading list animations.

---

## 🚀 9. Setup, Seeding & Deploy

### Environment Variables (.env)
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_ACCESS_SECRET="your-super-long-access-token-secret-key"
JWT_REFRESH_SECRET="your-super-long-refresh-token-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
ADMIN_EMAIL="admin@blog.com"
ADMIN_PASSWORD="SecurePassword123"
ADMIN_NAME="Blog Administrator"
NEXT_PUBLIC_SITE_URL="https://blueblog-v1.vercel.app"
NEXT_PUBLIC_SITE_NAME="BlueBlog"
```

### Seeding Guard Strategy
The [seed.ts](file:///home/md-warish-ansari/Projects/Blueblog/scripts/seed.ts) script has a safety validation block to prevent data corruption or duplicate entry errors on redeployments:
```typescript
const adminExists = await prisma.user.findFirst({
  where: { role: UserRole.ADMIN },
})
if (adminExists) {
  console.log('ℹ️ Database already seeded. Skipping seed.')
  return
}
```

### Deployment Build Command (Vercel)
To successfully deploy the database and bundle during Vercel builds, the following command pipeline is used:
```bash
npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run build
```
This ensures Prisma types are generated first, the PostgreSQL migrations are applied, database seeding is securely attempted (using the seed guard), and the Next.js bundle compiles successfully.
