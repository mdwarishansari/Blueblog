# BlueBlog Backend API

A modern, SEO-optimized blogging platform backend built with Express, Prisma, and PostgreSQL.

## Features

- 🔐 JWT-based authentication with HTTP-only cookies
- 👥 Role-based access control (Admin, Editor, Writer)
- 📝 Blog posts with rich text editor support
- 📂 Categories and tags
- 🖼️ Image upload with Cloudinary integration
- 📧 Contact form with message management
- ⚙️ Dynamic site settings
- 📊 Admin dashboard with statistics
- 🔄 Real-time updates
- 🐳 Docker containerization
- ☁️ Ready for cloud deployment (AWS EC2, Docker)

## Tech Stack

- **Runtime:** Node.js, TypeScript, Express
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** JWT, bcrypt
- **File Upload:** Cloudinary, Multer
- **Security:** Helmet, CORS, rate limiting
- **Deployment:** Docker, AWS EC2
- **Monitoring:** Winston logging, health checks

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Docker and Docker Compose (optional)
- Cloudinary account (for image uploads)

## Quick Start

### 1. Clone and setup

```bash
git clone <repository-url>
cd backend
cp .env.example .env