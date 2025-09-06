'use client'

import { useRouter } from 'next/navigation'
import { Plus, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseModalProps {
  mode?: 'create' | 'edit'
  courseId?: string
  trigger?: React.ReactNode
}

export function CourseModal({ mode = 'create', courseId, trigger }: CourseModalProps) {
  const router = useRouter()

  const handleClick = () => {
    if (mode === 'create') {
      router.push('/dashboard/content/courses/new')
    } else if (mode === 'edit' && courseId) {
      router.push(`/dashboard/content/courses/${courseId}/edit`)
    }
  }

  const defaultTrigger = mode === 'create' ? (
    <Button onClick={handleClick}>
      <Plus className="mr-2 h-4 w-4" />
      Créer un cours
    </Button>
  ) : (
    <Button variant="outline" onClick={handleClick}>
      <Edit className="mr-2 h-4 w-4" />
      Modifier
    </Button>
  )

  if (trigger) {
    return (
      <div onClick={handleClick} className="cursor-pointer">
        {trigger}
      </div>
    )
  }

  return defaultTrigger
}