import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FilterHeader } from '@/components/ui/filter-header'
import { History } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AI_LOG_STATUS_CONFIG, AI_PROVIDER_CONFIG } from '@/lib/constants'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface AILogsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function AILogsPage({ searchParams }: AILogsPageProps) {
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

  // Extract filters
  const serviceFilter = typeof searchParams.service === 'string' ? searchParams.service : undefined
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : undefined
  const providerFilter = typeof searchParams.provider === 'string' ? searchParams.provider : undefined

  // Build query
  let logsQuery = supabase
    .from('ai_usage_logs')
    .select('*, profiles(full_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50)

  if (serviceFilter) {
    logsQuery = logsQuery.eq('service_type', serviceFilter)
  }

  if (statusFilter) {
    logsQuery = logsQuery.eq('status', statusFilter)
  }

  if (providerFilter) {
    logsQuery = logsQuery.eq('provider', providerFilter)
  }

  const { data: logs, count } = await logsQuery

  // Calculate metrics
  const successCount = logs?.filter(l => l.status === 'success').length || 0
  const errorCount = logs?.filter(l => l.status === 'error').length || 0
  const totalTokens = logs?.reduce((sum, l) => sum + (l.total_tokens || 0), 0) || 0
  const avgProcessingTime = logs && logs.length > 0
    ? Math.round(logs.reduce((sum, l) => sum + (l.processing_time_ms || 0), 0) / logs.length)
    : 0

  return (
    <div className="space-y-6">
      <FilterHeader
        title="Logs IA"
        description="Historique et métriques d'utilisation de l'IA"
        icon={<History className="h-6 w-6 text-indigo-600" />}
      />

      {/* Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requêtes</CardDescription>
            <CardTitle className="text-3xl">{logs?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux de Succès</CardDescription>
            <CardTitle className="text-3xl">
              {logs && logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tokens</CardDescription>
            <CardTitle className="text-3xl">{totalTokens.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Temps Moyen</CardDescription>
            <CardTitle className="text-3xl">{avgProcessingTime}ms</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières Requêtes</CardTitle>
          <CardDescription>Affichage des 50 dernières requêtes IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Service</th>
                  <th className="text-left py-3 px-4 font-medium">Provider</th>
                  <th className="text-left py-3 px-4 font-medium">Modèle</th>
                  <th className="text-left py-3 px-4 font-medium">Statut</th>
                  <th className="text-right py-3 px-4 font-medium">Tokens</th>
                  <th className="text-right py-3 px-4 font-medium">Temps</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {log.service_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {AI_PROVIDER_CONFIG[log.provider as keyof typeof AI_PROVIDER_CONFIG]?.label || log.provider}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-mono text-muted-foreground">{log.model_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          style={{
                            backgroundColor: AI_LOG_STATUS_CONFIG[log.status as keyof typeof AI_LOG_STATUS_CONFIG]?.color + '20',
                            color: AI_LOG_STATUS_CONFIG[log.status as keyof typeof AI_LOG_STATUS_CONFIG]?.color,
                            borderColor: AI_LOG_STATUS_CONFIG[log.status as keyof typeof AI_LOG_STATUS_CONFIG]?.color
                          }}
                        >
                          {AI_LOG_STATUS_CONFIG[log.status as keyof typeof AI_LOG_STATUS_CONFIG]?.label || log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-sm">{log.total_tokens?.toLocaleString() || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-sm">{log.processing_time_ms ? `${log.processing_time_ms}ms` : '-'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun log disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
