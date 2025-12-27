import { createClient } from '@/lib/supabase/server'
import type { AIServiceType, AIProvider } from '@/types/database'

export interface AIConfig {
  provider: AIProvider
  modelName: string
  temperature: number
  maxOutputTokens: number
}

/**
 * Fetches the active AI configuration for a specific service from the database
 * @param serviceType - The AI service type ('copilot' or 'extraction')
 * @returns The configuration object or null if not found
 */
export async function getAIConfig(serviceType: AIServiceType): Promise<AIConfig | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ai_settings')
      .select('provider, model_name, temperature, max_output_tokens')
      .eq('setting_key', serviceType)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      console.error(`[AI Config] Failed to fetch config for ${serviceType}:`, error)
      return null
    }

    return {
      provider: data.provider,
      modelName: data.model_name,
      temperature: data.temperature,
      maxOutputTokens: data.max_output_tokens
    }
  } catch (error) {
    console.error(`[AI Config] Unexpected error fetching config for ${serviceType}:`, error)
    return null
  }
}

/**
 * Fallback default configurations if database config is unavailable
 * These match the current hardcoded values in the API routes
 */
export const AI_DEFAULTS: Record<AIServiceType, AIConfig> = {
  copilot: {
    provider: 'gemini',
    modelName: 'gemini-2.0-flash',
    temperature: 0.7,
    maxOutputTokens: 50
  },
  extraction: {
    provider: 'gemini',
    modelName: 'gemini-2-0-flash-exp',
    temperature: 0.2,
    maxOutputTokens: 4096
  }
}

/**
 * Gets the AI configuration with automatic fallback to defaults
 * @param serviceType - The AI service type ('copilot' or 'extraction')
 * @returns The configuration object (never null, falls back to defaults)
 */
export async function getAIConfigWithFallback(serviceType: AIServiceType): Promise<AIConfig> {
  const config = await getAIConfig(serviceType)
  return config || AI_DEFAULTS[serviceType]
}
