import { User } from 'lucide-react'
import { User as UserType } from '@prisma/client'
import { formatDate } from '@/lib/utils'

interface TeamMemberProps {
  member: Pick<
    UserType,
    'id' | 'name' | 'email' | 'bio' | 'role' | 'profileImage' | 'createdAt'
  >
}

export default function TeamMember({ member }: TeamMemberProps) {
  const roleStyles: Record<UserType['role'], string> = {
    ADMIN:
      'bg-purple-100 text-purple-700 shadow-[0_6px_16px_rgba(168,85,247,0.35)]',
    EDITOR:
      'bg-blue-100 text-blue-700 shadow-[0_6px_16px_rgba(59,130,246,0.35)]',
    WRITER:
      'bg-green-100 text-green-700 shadow-[0_6px_16px_rgba(34,197,94,0.35)]',
  }

  return (
    <div
      className="
        bg-card
        rounded-2xl
        p-6
        text-center
        elev-sm
        ui-transition
        ui-lift
        hover:elev-lg
      "
    >
      {/* Avatar */}
      <div className="mb-4 flex justify-center">
        <div
          className="
            relative
            h-24 w-24
            rounded-full
            bg-gradient-to-br
            from-accentStart
            via-accentMid
            to-accentEnd
            p-[3px]
          "
        >
          <div className="h-full w-full rounded-full bg-card flex items-center justify-center overflow-hidden">
            {member.profileImage ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${member.profileImage})` }}
              />
            ) : (
              <User className="h-12 w-12 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <h3 className="text-lg font-semibold text-fg">
        {member.name}
      </h3>

      {/* Role */}
      <div className="mt-2 mb-4 flex justify-center">
        <span
          className={`
            inline-flex
            items-center
            rounded-full
            px-3 py-1
            text-xs
            font-medium
            ${roleStyles[member.role]}
          `}
        >
          {member.role}
        </span>
      </div>

      {/* Bio */}
      <p className="mb-4 text-sm text-slate-600 line-clamp-3">
        {member.bio || 'Passionate about sharing knowledge and stories.'}
      </p>

      {/* Meta */}
      <div className="text-xs text-slate-400">
        Member since {formatDate(member.createdAt)}
      </div>
    </div>
  )
}
