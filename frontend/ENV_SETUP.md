# Environment Variables Setup

This frontend application requires the following environment variables:

## Required Variables

### `NEXT_PUBLIC_API_URL`
The URL of your backend Express API server.

**Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

**Production (EC2):**
```env
NEXT_PUBLIC_API_URL=https://your-ec2-domain.com/api
```

## Optional Variables

### `NEXT_PUBLIC_SITE_URL`
The public URL of your frontend site (for SEO and metadata).

**Development:**
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Production (Cloudflare):**
```env
NEXT_PUBLIC_SITE_URL=https://your-cloudflare-domain.com
```

### `NEXT_PUBLIC_SITE_NAME`
Site name for branding.

```env
NEXT_PUBLIC_SITE_NAME=BlueBlog
```

### `NEXT_PUBLIC_SITE_DESCRIPTION`
Site description for SEO.

```env
NEXT_PUBLIC_SITE_DESCRIPTION=Your blog description
```

## Setup Instructions

1. Create a `.env.local` file in the frontend directory:
   ```bash
   cd frontend
   cp .env.example .env.local  # if .env.example exists
   # OR create manually
   ```

2. Add the required variables to `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. Restart your Next.js development server after changing environment variables.

## Notes

- All `NEXT_PUBLIC_*` variables are exposed to the browser.
- Never commit `.env.local` to version control (it's in .gitignore).
- For production deployment on Cloudflare, set these variables in your Cloudflare Pages environment settings.
