// Database constants and enums

export const USER_ROLES = {
  USER: 'user' as const,      // Students
  MEMBER: 'member' as const,  // Country collaborators
  ADMIN: 'admin' as const     // Super admins
}

export const USER_STATUSES = {
  ACTIVE: 'active' as const,
  SUSPENDED: 'suspended' as const,
  DELETED: 'deleted' as const
}

export const COURSE_STATUSES = {
  DRAFT: 'draft' as const,
  PUBLISHED: 'published' as const,
  ARCHIVED: 'archived' as const
}

export const TAG_TYPES = {
  CHAPTER: 'chapter' as const,
  TOPIC: 'topic' as const,
  DIFFICULTY: 'difficulty' as const,
  EXAM_TYPE: 'exam_type' as const,
  SCHOOL: 'school' as const
}

export const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Très facile', color: '#10B981' },
  { value: 2, label: 'Facile', color: '#84CC16' },
  { value: 3, label: 'Moyen', color: '#F59E0B' },
  { value: 4, label: 'Difficile', color: '#EF4444' },
  { value: 5, label: 'Très difficile', color: '#DC2626' }
] as const

// Course status display config
export const COURSE_STATUS_CONFIG = {
  [COURSE_STATUSES.DRAFT]: {
    label: 'Brouillon',
    color: '#64748B',
    icon: 'file-edit'
  },
  [COURSE_STATUSES.PUBLISHED]: {
    label: 'Publié',
    color: '#10B981',
    icon: 'eye'
  },
  [COURSE_STATUSES.ARCHIVED]: {
    label: 'Archivé',
    color: '#6B7280',
    icon: 'archive'
  }
} as const

// User status display config
export const USER_STATUS_CONFIG = {
  [USER_STATUSES.ACTIVE]: {
    label: 'Actif',
    color: '#10B981',
    icon: 'check-circle'
  },
  [USER_STATUSES.SUSPENDED]: {
    label: 'Suspendu',
    color: '#F59E0B',
    icon: 'pause-circle'
  },
  [USER_STATUSES.DELETED]: {
    label: 'Supprimé',
    color: '#EF4444',
    icon: 'x-circle'
  }
} as const

// AI constants
export const AI_PROVIDERS = {
  OPENAI: 'openai' as const,
  GEMINI: 'gemini' as const
}

export const AI_SERVICES = {
  COPILOT: 'copilot' as const,
  EXTRACTION: 'extraction' as const
}

export const AI_LOG_STATUSES = {
  SUCCESS: 'success' as const,
  ERROR: 'error' as const,
  TIMEOUT: 'timeout' as const
}

// AI provider configuration
export const AI_PROVIDER_CONFIG = {
  [AI_PROVIDERS.OPENAI]: {
    label: 'OpenAI',
    defaultModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    color: '#10A37F'
  },
  [AI_PROVIDERS.GEMINI]: {
    label: 'Google Gemini',
    defaultModels: ['gemini-2.0-flash', 'gemini-2-0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    color: '#4285F4'
  }
} as const

// AI log status display config
export const AI_LOG_STATUS_CONFIG = {
  [AI_LOG_STATUSES.SUCCESS]: {
    label: 'Succès',
    color: '#10B981',
    icon: 'check-circle'
  },
  [AI_LOG_STATUSES.ERROR]: {
    label: 'Erreur',
    color: '#EF4444',
    icon: 'x-circle'
  },
  [AI_LOG_STATUSES.TIMEOUT]: {
    label: 'Timeout',
    color: '#F59E0B',
    icon: 'clock'
  }
} as const
