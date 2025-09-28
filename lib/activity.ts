"use client"

import { createClient } from '@/lib/supabase/client'

export type ActivityStatus = 'success' | 'failure'

export interface LogActivityPayload {
  action: string
  entityType: string
  entityId?: string | null
  entityName?: string | null
  status?: ActivityStatus
  note?: string | null
  metadata?: Record<string, unknown> | null
}

export async function logActivity(payload: LogActivityPayload) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from('activity_logs').insert({
      action_type: payload.action,
      entity_type: payload.entityType,
      entity_id: payload.entityId ?? null,
      entity_name: payload.entityName ?? null,
      status: payload.status ?? 'success',
      note: payload.note ?? null,
      metadata: payload.metadata ?? {},
    })

    if (error) {
      console.error('Failed to log activity:', error)
    }
  } catch (error) {
    console.error('Unexpected error while logging activity:', error)
  }
}
