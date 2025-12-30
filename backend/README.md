# 📝 **Blog Platform Backend API Documentation**

Live- https://blueblog-942c.onrender.com

## 🌟 **Table of Contents**

- [✨ Overview](#-overview)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Variables](#️-environment-variables)
- [🗄️ Database Schema](#️-database-schema)
- [🔐 Authentication & Authorization](#-authentication--authorization)
- [📊 API Endpoints – Complete List](#-api-endpoints--complete-list)
- [📖 API Explanations](#-api-explanations)
- [📦 Request & Response Format](#-request--response-format)
- [🧪 Minimal API Testing (Frontend Required)](#-minimal-api-testing-frontend-required)
- [🐳 Deployment](#-deployment)
- [🎯 Troubleshooting](#-troubleshooting)

---

## ✨ **Overview**

A **production-ready, SEO-optimized backend API** for a blogging platform built using:

- **Node.js**
- **Express**
- **PostgreSQL**
- **Prisma ORM**

Designed for **high traffic**, **role-based workflows**, and **frontend consumption** (React / Next / Flutter / Android).

### **Key Features**

- JWT authentication (access + refresh tokens)
- Role-based authorization (ADMIN, EDITOR, WRITER)
- SEO-friendly blog structure
- Image upload & optimization using Cloudinary
- RESTful, predictable APIs
- Pagination, filtering & search
- Security middleware (Helmet, Rate Limit)
- Prisma migrations & seeding

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js v18+
- PostgreSQL v14+
- Cloudinary account

### **Installation**

```bash
cd backend
npm install
cp .env.example .env
```

### **Database Setup**

```bash
sudo -u postgres psql
CREATE DATABASE blogdb;
CREATE USER bloguser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE blogdb TO bloguser;
ALTER USER bloguser CREATEDB;
\q
```

### **Run Prisma**

```bash
npm run prisma:migrate
npm run prisma:seed
```

### **Start Server**

```bash
npm run dev
```

Server URL:

```
http://localhost:4000
```

---

## ⚙️ **Environment Variables**

```env
NODE_ENV=development
PORT=4000
APP_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://bloguser:your_password@localhost:5432/blogdb?schema=public

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

ADMIN_EMAIL=admin@blog.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Blog Administrator

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000

LOG_LEVEL=info
DEFAULT_PAGE_LIMIT=12
MAX_PAGE_LIMIT=50
```

---

## 🗄️ **Database Schema**

### **Models**

| Model        | Purpose            |
| ------------ | ------------------ |
| User         | Platform users     |
| Post         | Blog posts         |
| Category     | Post categories    |
| Image        | Uploaded images    |
| RefreshToken | JWT refresh tokens |

### **Roles**

- **ADMIN** – full access
- **EDITOR** – publish/manage posts
- **WRITER** – create own posts

### **Post Status**

- DRAFT
- PUBLISHED

---

## 🔐 **Authentication & Authorization**

### **Auth Flow**

1. Login → access + refresh token
2. Access token (15 min)
3. Refresh token stored in DB
4. Refresh API issues new tokens

### **Auth Header**

```http
Authorization: Bearer <access_token>
```

---

# 📊 **API Endpoints – Complete List**

**Base URL**

```
/api/v1
```

### 🔑 Authentication

```
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/change-password
GET    /auth/me
```

### 👥 Users

```
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
```

### 📝 Posts

```
GET    /posts
GET    /posts/slug/:slug
POST   /posts
PUT    /posts/:id
DELETE /posts/:id
POST   /posts/:id/publish
POST   /posts/:id/unpublish
GET    /posts/:id/related
```

### 🏷️ Categories

```
GET    /categories
GET    /categories/slug/:slug
GET    /categories/:slug/posts
POST   /categories
PUT    /categories/:id
DELETE /categories/:id
```

### 📸 Images

```
POST   /images/upload
GET    /images
GET    /images/:id
PUT    /images/:id
DELETE /images/:id
```

---

# 📖 **API Explanations**

## 🔑 Authentication APIs

### **POST /auth/login**

Login user using email/password.
Returns tokens + user profile.

### **POST /auth/refresh**

Generates new access token using refresh token.

### **GET /auth/me**

Returns logged-in user details.

### **POST /auth/change-password**

Change current user password.

### **POST /auth/logout**

Invalidates refresh token.

---

## 👥 User APIs

- **GET /users** → paginated list (ADMIN, EDITOR)
- **POST /users** → create user (ADMIN)
- **PUT /users/:id** → update user (ADMIN)
- **DELETE /users/:id** → delete user (ADMIN)

---

## 📝 Post APIs

### **GET /posts**

Public posts with pagination, search, filters.

Query params:

```
page, limit, search, category, author, status, sort
```

### **POST /posts**

Create post (WRITER+)

### **PUT /posts/:id**

Update post (author or EDITOR+)

### **POST /posts/:id/publish**

Publish draft (EDITOR+)

### **GET /posts/slug/:slug**

Public SEO-friendly post fetch.

---

## 🏷️ Category APIs

- Create / update / delete categories (ADMIN)
- Fetch posts by category slug (Public)

---

## 📸 Image APIs

### **POST /images/upload**

Upload image via `multipart/form-data`.

Fields:

```
image, altText, title, caption
```

Used for post banners & content.

---

## 📦 **Request & Response Format**

### Success

```json
{
  "status": "success",
  "data": {}
}
```

### Error

```json
{
  "status": "error",
  "message": "Error message"
}
```

---

## 🧪 **Minimal API Testing (Frontend Required)**

Frontend **must** test only these:

```text
GET    /health
POST   /auth/login
POST   /auth/refresh
GET    /auth/me
GET    /posts
GET    /posts/slug/:slug
```

---

## 🐳 **Deployment**

```bash
npm run build
npm start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm","start"]
```

---

## 🎯 **Troubleshooting**

### Prisma Reset

```bash
npx prisma migrate reset
npx prisma migrate dev
```

### DB Check

```bash
psql -h localhost -U bloguser -d blogdb
```

---

## 📄 **License**

MIT

---

## 🙏 **Acknowledgments**

- Express.js
- Prisma
- PostgreSQL
- Cloudinary

---
