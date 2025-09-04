import { Badge } from '@/components/ui/badge'
import { COURSE_STATUS_CONFIG, USER_STATUS_CONFIG } from '@/lib/constants'
import type { CourseStatus, UserStatus } from '@/types/database'
import { cn } from '@/lib/utils'

interface CourseStatusBadgeProps {
  status: CourseStatus
  className?: string
}

export function CourseStatusBadge({ status, className }: CourseStatusBadgeProps) {
  const config = COURSE_STATUS_CONFIG[status]
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        "text-xs font-medium",
        status === 'publish' && "border-green-500 text-green-700 bg-green-50",
        status === 'draft' && "border-gray-500 text-gray-700 bg-gray-50", 
        status === 'archived' && "border-amber-500 text-amber-700 bg-amber-50",
        className
      )}
    >
      {config.label}
    </Badge>
  )
}

interface UserStatusBadgeProps {
  status: UserStatus
  className?: string
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const config = USER_STATUS_CONFIG[status]
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        "text-xs font-medium",
        status === 'active' && "border-green-500 text-green-700 bg-green-50",
        status === 'suspended' && "border-orange-500 text-orange-700 bg-orange-50",
        status === 'deleted' && "border-red-500 text-red-700 bg-red-50",
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
