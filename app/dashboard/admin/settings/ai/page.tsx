import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FilterHeader } from '@/components/ui/filter-header'
import { AISettingsManager } from '@/components/admin/ai-settings-manager'
import { Settings } from 'lucide-react'

export default async function AISettingsPage() {
  const supabase = await createClient()

  // Get the current user and check permissions
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch AI settings
  const { data: settings } = await supabase
    .from('ai_settings')
    .select('*')
    .order('setting_key')

  return (
    <div className="space-y-6">
      <FilterHeader
        title="Configuration IA"
        description="Gérez les paramètres des modèles d'intelligence artificielle"
        icon={<Settings className="h-6 w-6 text-purple-600" />}
      />

      <AISettingsManager initialSettings={settings || []} />
    </div>
  )
}
