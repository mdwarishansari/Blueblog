# Frontend-Backend Integration Summary

## Changes Completed

### ✅ 1. Created API Client Utility
- **File**: `frontend/lib/api.ts`
- Centralized API client for all backend API calls
- Handles credentials (cookies) automatically
- Includes helper functions: `apiGet`, `apiPost`, `apiPut`, `apiDelete`, `apiUpload`

### ✅ 2. Updated All Frontend API Calls
All client-side components now use the backend API instead of Next.js API routes:

- `components/Header.tsx` - Site settings
- `app/login/page.tsx` - Login & site branding
- `app/(public)/contact/ContactClient.tsx` - Contact form
- `app/admin/(protected)/account/page.tsx` - User account management
- `app/admin/(protected)/users/page.tsx` - User management
- `app/admin/(protected)/messages/page.tsx` - Contact messages
- `app/admin/(protected)/images/page.tsx` - Media management
- `app/admin/(protected)/categories/page.tsx` - Category management
- `app/admin/(protected)/settings/page.tsx` - Site settings
- `app/admin/(protected)/posts/new/page.tsx` - Create post
- `app/admin/(protected)/posts/[id]/page.tsx` - Edit post
- `components/PostTable.tsx` - Post management table
- `lib/useCurrentUser.ts` - Current user hook

### ✅ 3. Deleted Next.js API Routes
- Removed entire `frontend/app/api/` folder
- All API functionality now handled by Express backend

### ✅ 4. Updated Authentication
- Updated `lib/auth.ts` to work with backend JWT tokens
- Authentication cookies are automatically sent with API requests

### ✅ 5. Environment Configuration
- Created `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
- Created `ENV_SETUP.md` with environment variable documentation

## API Endpoint Mappings

### Frontend → Backend Route Mapping

| Frontend (Old) | Backend (New) |
|----------------|---------------|
| `/api/auth/login` | `/api/auth/login` |
| `/api/auth/logout` | `/api/auth/logout` |
| `/api/auth/refresh` | `/api/auth/refresh` |
| `/api/admin/account` | `/api/auth/me` |
| `/api/admin/users` | `/api/admin/users` |
| `/api/admin/messages` | `/api/admin/messages` |
| `/api/admin/posts` | `/api/admin/posts` |
| `/api/admin/categories` | `/api/admin/categories` |
| `/api/admin/settings` | `/api/admin/settings` |
| `/api/upload/cloudinary` | `/api/upload/image` |
| `/api/categories` | `/api/categories` (public) |
| `/api/posts` | `/api/posts` (public) |
| `/api/contact` | `/api/contact` (public) |
| `/api/public/settings` | `/api/settings/site-info` |

## Important Notes

### ⚠️ Server Components Still Using Prisma
Some server-side rendered pages still use Prisma directly:
- `app/admin/(protected)/dashboard/page.tsx`
- `app/admin/(protected)/posts/page.tsx`

These will need to be updated to use API calls if the database is only accessible from the backend. For now, they continue to work if Prisma has database access.

### ⚠️ Bulk Operations
The bulk post operations in `PostTable.tsx` now perform individual API calls since the backend doesn't have a bulk endpoint. This is less efficient but functional.

### ✅ Cookie-Based Authentication
- Backend sets `access_token` and `refresh_token` cookies
- Frontend automatically includes cookies with API requests using `credentials: 'include'`
- CORS must be configured on backend to allow credentials

## Testing Checklist

Before deploying, verify:

1. **Backend is running** on port 4000 (or configured port)
2. **Frontend environment variables** are set correctly
3. **CORS configuration** on backend allows frontend origin
4. **Database connection** is working
5. **Login flow** works end-to-end
6. **API calls** are successful (check browser network tab)
7. **Cookies** are being set and sent correctly

## Next Steps

1. **Update CORS in backend** to allow your frontend origin:
   ```env
   ALLOWED_ORIGINS=http://localhost:3000,https://your-cloudflare-domain.com
   ```

2. **Test all functionality**:
   - Login/Logout
   - Create/Edit/Delete posts
   - Manage categories
   - Upload images
   - Manage users
   - Site settings

3. **Update server components** (if needed):
   - Convert dashboard and posts list to client components or API calls
   - Or ensure Prisma has database access on frontend server

4. **Production deployment**:
   - Set `NEXT_PUBLIC_API_URL` to your EC2 backend URL
   - Update backend `ALLOWED_ORIGINS` with Cloudflare domain
   - Ensure HTTPS is configured for production

## Running the Application

### Backend
```bash
cd backend
npm install
npm run dev  # Runs on port 4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Runs on port 3000
```

Make sure `.env.local` is configured with the correct backend URL!
