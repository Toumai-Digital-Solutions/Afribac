'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { AISetting } from '@/types/database'
import { AI_PROVIDERS, AI_PROVIDER_CONFIG } from '@/lib/constants'
import { Loader2, Sparkles, FileText } from 'lucide-react'

interface AISettingsManagerProps {
  initialSettings: AISetting[]
}

export function AISettingsManager({ initialSettings }: AISettingsManagerProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const copilotSetting = initialSettings.find(s => s.setting_key === 'copilot')
  const extractionSetting = initialSettings.find(s => s.setting_key === 'extraction')

  const handleUpdate = async (settingKey: string, updates: Partial<AISetting>) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('ai_settings')
        .update(updates)
        .eq('setting_key', settingKey)

      if (error) throw error

      toast.success('Configuration mise à jour avec succès')
      router.refresh()
    } catch (error) {
      console.error('Error updating AI settings:', error)
      toast.error('Erreur lors de la mise à jour de la configuration')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Copilot Settings Card */}
      {copilotSetting && (
        <AISettingCard
          setting={copilotSetting}
          title="AI Copilot"
          description="Assistant IA pour aide aux cours"
          icon={<Sparkles className="h-5 w-5" />}
          onUpdate={(updates) => handleUpdate('copilot', updates)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Extraction Settings Card */}
      {extractionSetting && (
        <AISettingCard
          setting={extractionSetting}
          title="Extraction PDF"
          description="OCR et extraction de contenu"
          icon={<FileText className="h-5 w-5" />}
          onUpdate={(updates) => handleUpdate('extraction', updates)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

interface AISettingCardProps {
  setting: AISetting
  title: string
  description: string
  icon: React.ReactNode
  onUpdate: (updates: Partial<AISetting>) => Promise<void>
  isSubmitting: boolean
}

function AISettingCard({ setting, title, description, icon, onUpdate, isSubmitting }: AISettingCardProps) {
  const [formData, setFormData] = useState({
    provider: setting.provider,
    model_name: setting.model_name,
    temperature: setting.temperature,
    max_output_tokens: setting.max_output_tokens,
    is_active: setting.is_active,
    description: setting.description || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.temperature < 0 || formData.temperature > 2) {
      toast.error('La température doit être entre 0 et 2')
      return
    }

    if (formData.max_output_tokens < 1) {
      toast.error('Le nombre de tokens doit être supérieur à 0')
      return
    }

    await onUpdate(formData)
  }

  const providerModels = AI_PROVIDER_CONFIG[formData.provider as keyof typeof AI_PROVIDER_CONFIG]?.defaultModels || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider Select */}
          <div className="space-y-2">
            <Label htmlFor={`provider-${setting.id}`}>Fournisseur</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) => setFormData({ ...formData, provider: value as typeof formData.provider })}
            >
              <SelectTrigger id={`provider-${setting.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AI_PROVIDERS.OPENAI}>
                  {AI_PROVIDER_CONFIG[AI_PROVIDERS.OPENAI].label}
                </SelectItem>
                <SelectItem value={AI_PROVIDERS.GEMINI}>
                  {AI_PROVIDER_CONFIG[AI_PROVIDERS.GEMINI].label}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model Name Input with Suggestions */}
          <div className="space-y-2">
            <Label htmlFor={`model-${setting.id}`}>Modèle</Label>
            <Input
              id={`model-${setting.id}`}
              value={formData.model_name}
              onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
              placeholder="ex: gemini-2.0-flash"
            />
            {providerModels.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Suggestions: {providerModels.join(', ')}
              </div>
            )}
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`temp-${setting.id}`}>Température</Label>
              <span className="text-sm text-muted-foreground">{formData.temperature.toFixed(2)}</span>
            </div>
            <Slider
              id={`temp-${setting.id}`}
              min={0}
              max={2}
              step={0.1}
              value={[formData.temperature]}
              onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              0 = déterministe, 2 = créatif
            </p>
          </div>

          {/* Max Tokens Input */}
          <div className="space-y-2">
            <Label htmlFor={`tokens-${setting.id}`}>Tokens de sortie max</Label>
            <Input
              id={`tokens-${setting.id}`}
              type="number"
              min={1}
              value={formData.max_output_tokens}
              onChange={(e) => setFormData({ ...formData, max_output_tokens: parseInt(e.target.value) })}
            />
          </div>

          {/* Is Active Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={`active-${setting.id}`}>Actif</Label>
              <p className="text-sm text-muted-foreground">
                Activer ce service
              </p>
            </div>
            <Switch
              id={`active-${setting.id}`}
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Label htmlFor={`desc-${setting.id}`}>Description</Label>
            <Textarea
              id={`desc-${setting.id}`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description optionnelle..."
              rows={2}
            />
          </div>

          {/* Save Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sauvegarder
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
