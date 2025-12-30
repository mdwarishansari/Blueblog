# 📝 BlueBlog – Backend API Documentation

🌐 **Live API URL**
👉 **[https://blueblog-942c.onrender.com](https://blueblog-942c.onrender.com)**

---

## 📌 Overview

**BlueBlog Backend** is a **production-ready REST API** powering a modern blogging platform with **role-based access**, **SEO-friendly content**, and **secure authentication**.

Built for scalability and clean frontend integration (Next.js, React, Mobile apps).

---

## 🧠 Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Runtime    | Node.js (v18+)                |
| Framework  | Express.js                    |
| Database   | PostgreSQL                    |
| ORM        | Prisma                        |
| Auth       | JWT (Access + Refresh Tokens) |
| Media      | Cloudinary                    |
| Security   | Helmet, Rate Limiting         |
| Deployment | Render                        |

---

## ✨ Core Features

- 🔐 Secure JWT Authentication (Access + Refresh)
- 👥 Role-Based Authorization
  (`ADMIN`, `EDITOR`, `WRITER`)
- 📝 Draft & Publish workflow
- 🏷️ Category-based blogging
- 📸 Image upload & management
- 🔎 Pagination, filtering, search
- 🧱 Modular, scalable architecture
- 🔁 Token rotation & refresh handling
- ⚡ Optimized for frontend consumption

---

## 📂 Project Structure (Backend)

```
backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── config/        # env, auth, cloudinary, db
│   ├── middleware/   # auth, error, rate-limit
│   ├── modules/      # auth, posts, users, images, categories
│   ├── utils/        # helpers, logger, error handler
│   ├── app.ts
│   └── server.ts
│
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### ✅ Prerequisites

- Node.js **v18+**
- PostgreSQL **v14+**
- Cloudinary Account

---

### 📦 Installation

```bash
cd backend
npm install
cp .env.example .env
```

---

### 🗄️ Database Setup

```sql
CREATE DATABASE blogdb;
CREATE USER bloguser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE blogdb TO bloguser;
ALTER USER bloguser CREATEDB;
```

---

### 🔄 Prisma Setup

```bash
npm run prisma:migrate
npm run prisma:seed
```

---

### ▶ Start Server

```bash
npm run dev
```

**Local API URL**

```
http://localhost:4000
```

---

## ⚙️ Environment Variables

```env
NODE_ENV=development
PORT=4000
APP_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://bloguser:password@localhost:5432/blogdb

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

ADMIN_EMAIL=admin@blog.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Blog Administrator

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000

DEFAULT_PAGE_LIMIT=12
MAX_PAGE_LIMIT=50
LOG_LEVEL=info
```

---

## 🧬 Database Design

### 📦 Models

| Model        | Description    |
| ------------ | -------------- |
| User         | Platform users |
| Post         | Blog content   |
| Category     | Post grouping  |
| Image        | Uploaded media |
| RefreshToken | Token rotation |

---

### 🧑‍💻 User Roles

| Role   | Permissions               |
| ------ | ------------------------- |
| ADMIN  | Full system access        |
| EDITOR | Publish & manage posts    |
| WRITER | Create & manage own posts |

---

### 📝 Post Status

- `DRAFT`
- `PUBLISHED`

---

## 🔐 Authentication & Security

### 🔑 Auth Flow

1. User logs in
2. Access token issued (15 min)
3. Refresh token stored in DB
4. Refresh endpoint rotates tokens
5. Logout invalidates refresh token

### 🔒 Protected Routes

```http
Authorization: Bearer <access_token>
```

---

## 📊 API Endpoints

### 🔐 Auth

```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/change-password
GET    /api/v1/auth/me
```

---

### 👥 Users (ADMIN)

```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
```

---

### 📝 Posts

```
GET    /api/v1/posts
GET    /api/v1/posts/slug/:slug
POST   /api/v1/posts
PUT    /api/v1/posts/:id
DELETE /api/v1/posts/:id
POST   /api/v1/posts/:id/publish
POST   /api/v1/posts/:id/unpublish
GET    /api/v1/posts/:id/related
```

---

### 🏷️ Categories

```
GET    /api/v1/categories
GET    /api/v1/categories/slug/:slug
GET    /api/v1/categories/:slug/posts
POST   /api/v1/categories
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

---

### 📸 Images

```
POST   /api/v1/images/upload
GET    /api/v1/images
GET    /api/v1/images/:id
PUT    /api/v1/images/:id
DELETE /api/v1/images/:id
```

---

## 🔎 Query Parameters (Posts)

```
page
limit
search
category
author
status
sort
```

---

## 📦 API Response Format

### ✅ Success

```json
{
  "status": "success",
  "data": {}
}
```

### ❌ Error

```json
{
  "status": "error",
  "message": "Something went wrong"
}
```

---

## 🧪 Minimal Testing Checklist (Frontend)

Only these endpoints are required to verify backend health:

```
GET    /health
POST   /auth/login
POST   /auth/refresh
GET    /auth/me
GET    /posts
GET    /posts/slug/:slug
```

---

## 🚀 Deployment (Render)

```bash
npm run build
npm start
```

---

## 🐳 Docker (Optional)

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

## 🛠️ Troubleshooting

### Reset Prisma

```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Database Access

```bash
psql -U bloguser -d blogdb
```

---

## 📄 License

MIT License

---

## 🙌 Acknowledgments

- Express.js
- Prisma ORM
- PostgreSQL
- Cloudinary
- Render

---
