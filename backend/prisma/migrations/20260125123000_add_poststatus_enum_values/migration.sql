-- Manual migration: PostStatus enum extension
-- Required because Prisma cannot safely diff PostgreSQL enums

ALTER TYPE "PostStatus" ADD VALUE IF NOT EXISTS 'VERIFICATION_PENDING';
ALTER TYPE "PostStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';
