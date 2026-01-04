import { User } from 'lucide-react'
import { User as UserType } from '@prisma/client'
import { formatDate } from '@/lib/utils'

interface TeamMemberProps {
  member: Pick<UserType, 'id' | 'name' | 'email' | 'bio' | 'role' | 'profileImage' | 'createdAt'>
}

export default function TeamMember({ member }: TeamMemberProps) {
  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-800',
    EDITOR: 'bg-blue-100 text-blue-800',
    WRITER: 'bg-green-100 text-green-800',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg">
      <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-400 text-white">
        {member.profileImage ? (
          <div className="h-full w-full rounded-full bg-cover bg-center" 
               style={{ backgroundImage: `url(${member.profileImage})` }} />
        ) : (
          <User className="h-12 w-12" />
        )}
      </div>
      <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
      <div className="mb-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${roleColors[member.role]}`}>
          {member.role}
        </span>
      </div>
      <p className="mb-4 text-gray-600">{member.bio || 'Passionate about sharing knowledge and stories.'}</p>
      <div className="text-sm text-gray-500">
        Member since {formatDate(member.createdAt)}
      </div>
    </div>
  )
}