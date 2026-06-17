import { UserAvatar } from '@/components/ui/UserAvatar'
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
    ADMIN: 'bg-lavender-mist text-vivid-violet',
    EDITOR: 'bg-powder-blue/40 text-electric-cobalt',
    WRITER: 'bg-green-50 text-forest border border-green-100',
  }

  return (
    <div
      className="
        group
        bg-pure-white
        rounded-[16px]
        p-6
        text-center
        border border-hairline
        shadow-subtle
        hover:shadow-lg
        transition-all duration-300
      "
    >
      {/* Avatar */}
      <div className="mb-4 flex justify-center">
        <UserAvatar
          src={member.profileImage}
          name={member.name}
          size="xl"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Name */}
      <h3 className="text-lg font-bold text-ink-charcoal transition-colors duration-150 group-hover:text-electric-cobalt">
        {member.name}
      </h3>

      {/* Role */}
      <div className="mt-2 mb-4 flex justify-center">
        <span
          className={`
            inline-flex
            items-center
            rounded-[8px]
            px-2.5 py-0.5
            text-xs
            font-medium
            ${roleStyles[member.role]}
          `}
        >
          {member.role}
        </span>
      </div>

      {/* Bio */}
      <p className="mb-4 text-sm text-slate-gray line-clamp-3 leading-relaxed">
        {member.bio || 'Passionate about sharing knowledge and stories.'}
      </p>

      {/* Meta */}
      <div className="text-xs text-steel-gray">
        Member since {formatDate(member.createdAt)}
      </div>
    </div>
  )
}
