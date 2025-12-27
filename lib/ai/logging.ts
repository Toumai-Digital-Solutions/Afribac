import { createClient } from '@/lib/supabase/server'
import type { AIServiceType, AIProvider, AILogStatus } from '@/types/database'

export interface LogAIUsageParams {
  serviceType: AIServiceType
  userId?: string
  provider: AIProvider
  modelName: string
  promptSummary?: string
  status: AILogStatus
  errorMessage?: string
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  processingTimeMs?: number
  referenceType?: string
  referenceId?: string
  metadata?: Record<string, any>
}

/**
 * Logs AI usage to the database for monitoring and analytics
 * This function never throws - logging failures should not break the main flow
 * @param params - The logging parameters
 */
export async function logAIUsage(params: LogAIUsageParams): Promise<void> {
  try {
    const supabase = await createClient()

    // Truncate prompt summary to 200 characters for storage efficiency
    const promptSummary = params.promptSummary
      ? params.promptSummary.substring(0, 200)
      : null

    const { error } = await supabase
      .from('ai_usage_logs')
      .insert({
        service_type: params.serviceType,
        user_id: params.userId || null,
        provider: params.provider,
        model_name: params.modelName,
        prompt_summary: promptSummary,
        status: params.status,
        error_message: params.errorMessage || null,
        input_tokens: params.inputTokens || null,
        output_tokens: params.outputTokens || null,
        total_tokens: params.totalTokens || null,
        processing_time_ms: params.processingTimeMs || null,
        reference_type: params.referenceType || null,
        reference_id: params.referenceId || null,
        metadata: params.metadata || {}
      })

    if (error) {
      console.error('[AI Logging] Failed to log AI usage:', error)
      // Don't throw - logging failure shouldn't break the main flow
    }
  } catch (error) {
    console.error('[AI Logging] Unexpected error logging AI usage:', error)
    // Don't throw - logging failure shouldn't break the main flow
  }
}

/**
 * Helper function to calculate total tokens if not provided by the AI SDK
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @returns The total token count or null if either value is missing
 */
export function calculateTotalTokens(
  inputTokens?: number | null,
  outputTokens?: number | null
): number | null {
  if (inputTokens != null && outputTokens != null) {
    return inputTokens + outputTokens
  }
  return null
}
