import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewPostClient from './NewPostClient'

export default async function Page() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <NewPostClient userRole={user.role} />
}
