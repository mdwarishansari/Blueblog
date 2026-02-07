import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EditPostClient from './EditPostClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params   // ✅ THIS IS THE FIX

  return (
    <EditPostClient
      userRole={user.role}
      postId={id}
    />
  )
}
