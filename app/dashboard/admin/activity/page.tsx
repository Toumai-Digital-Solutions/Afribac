import Link from 'next/link'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import type { ActivityLogDetail } from '@/types/database'

const PAGE_SIZE = 25

type ActivityPageSearchParams = {
  [key: string]: string | string[] | undefined
}

function getParam(params: ActivityPageSearchParams, key: string) {
  const value = params[key]
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }
  return value ?? ''
}

function sanitizeOption(value: string | null | undefined) {
  return value ?? ''
}

function formatMetadata(metadata: any): Array<{ key: string; value: string }> {
  if (!metadata || typeof metadata !== 'object') return []

  if (Array.isArray(metadata)) {
    return metadata.map((item, index) => ({ key: index.toString(), value: String(item) }))
  }

  return Object.entries(metadata).map(([key, value]) => ({ key, value: Array.isArray(value) ? value.join(', ') : String(value) }))
}

function getStatusBadge(status: string | null) {
  if (status === 'failure') {
    return <Badge variant="destructive">Échec</Badge>
  }
  return <Badge variant="outline" className="border-green-500/40 text-green-600 dark:text-green-400">Succès</Badge>
}

export default async function AdminActivityPage({ searchParams }: { searchParams: ActivityPageSearchParams }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const actionFilter = getParam(searchParams, 'action')
  const entityFilter = getParam(searchParams, 'entity')
  const roleFilter = getParam(searchParams, 'role')
  const statusFilter = getParam(searchParams, 'status')
  const actorFilter = getParam(searchParams, 'actor')
  const searchTerm = getParam(searchParams, 'search')
  const pageParam = Number(getParam(searchParams, 'page'))
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let logsQuery = supabase
    .from('activity_log_details')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (actionFilter) {
    logsQuery = logsQuery.eq('action_type', actionFilter)
  }

  if (entityFilter) {
    logsQuery = logsQuery.eq('entity_type', entityFilter)
  }

  if (roleFilter) {
    logsQuery = logsQuery.eq('actor_role', roleFilter)
  }

  if (statusFilter) {
    logsQuery = logsQuery.eq('status', statusFilter)
  }

  if (actorFilter) {
    logsQuery = logsQuery.eq('actor_id', actorFilter)
  }

  if (searchTerm) {
    const escaped = searchTerm.replace(/'/g, "''")
    logsQuery = logsQuery.or(
      `entity_name.ilike.%${escaped}%,note.ilike.%${escaped}%,action_type.ilike.%${escaped}%,actor_name.ilike.%${escaped}%`
    )
  }

  logsQuery = logsQuery.range(from, to)

  const [logsResult, actionsResult, entitiesResult, rolesResult, actorsResult] = await Promise.all([
    logsQuery,
    supabase.from('activity_logs').select('action_type', { distinct: true }).not('action_type', 'is', null).order('action_type', { ascending: true }),
    supabase.from('activity_logs').select('entity_type', { distinct: true }).not('entity_type', 'is', null).order('entity_type', { ascending: true }),
    supabase.from('activity_logs').select('actor_role', { distinct: true }).not('actor_role', 'is', null).order('actor_role', { ascending: true }),
    supabase
      .from('activity_log_details')
      .select('actor_id, actor_name, actor_email', { distinct: true })
      .not('actor_id', 'is', null)
      .order('actor_name', { ascending: true }),
  ])

  if (logsResult.error) {
    console.error('Error fetching activity logs:', logsResult.error)
    throw new Error('Impossible de charger les journaux d\'activité.')
  }

  const logs = (logsResult.data ?? []) as ActivityLogDetail[]
  const total = logsResult.count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const actions = Array.from(
    new Set((actionsResult.data ?? []).map((row) => sanitizeOption((row as any).action_type)).filter(Boolean))
  ).sort()

  const entities = Array.from(
    new Set((entitiesResult.data ?? []).map((row) => sanitizeOption((row as any).entity_type)).filter(Boolean))
  ).sort()

  const roles = Array.from(
    new Set((rolesResult.data ?? []).map((row) => sanitizeOption((row as any).actor_role)).filter(Boolean))
  ).sort()

  const actors = (actorsResult.data ?? [])
    .map((row) => ({
      id: (row as any).actor_id as string,
      name: sanitizeOption((row as any).actor_name),
      email: sanitizeOption((row as any).actor_email),
    }))
    .filter((actor) => actor.id)
    .sort((a, b) => (a.name || a.email || '').localeCompare(b.name || b.email || ''))

  const hasFilters = Boolean(actionFilter || entityFilter || roleFilter || statusFilter || actorFilter || searchTerm)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des actions</h1>
          <p className="text-muted-foreground">
            Suivez toutes les actions réalisées par les administrateurs et membres sur la plateforme.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3" method="get">
            <div className="md:col-span-2">
              <label className="text-sm font-medium" htmlFor="search">Recherche</label>
              <Input
                id="search"
                name="search"
                placeholder="Rechercher par action, entité ou utilisateur..."
                defaultValue={searchTerm}
              />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="action">Action</label>
              <select
                id="action"
                name="action"
                defaultValue={actionFilter}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="">Toutes les actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="entity">Entité</label>
              <select
                id="entity"
                name="entity"
                defaultValue={entityFilter}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="">Toutes les entités</option>
                {entities.map((entity) => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="role">Rôle</label>
              <select
                id="role"
                name="role"
                defaultValue={roleFilter}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="">Tous les rôles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="status">Statut</label>
              <select
                id="status"
                name="status"
                defaultValue={statusFilter}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="success">Succès</option>
                <option value="failure">Échec</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="actor">Auteur</label>
              <select
                id="actor"
                name="actor"
                defaultValue={actorFilter}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="">Tous les utilisateurs</option>
                {actors.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name || actor.email || actor.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-6 flex items-center gap-2">
              <Button type="submit">Appliquer</Button>
              {hasFilters && (
                <Button type="button" variant="ghost" asChild>
                  <Link href="/dashboard/admin/activity">Réinitialiser</Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Journal d&apos;activité</CardTitle>
            <p className="text-sm text-muted-foreground">{total} action{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entité</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      Aucune activité trouvée pour ces filtres.
                    </TableCell>
                  </TableRow>
                )}
                {logs.map((log) => {
                  const metadataEntries = formatMetadata(log.metadata)
                  const relativeDate = formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })

                  return (
                    <TableRow key={log.id}>
                      <TableCell className="space-y-1">
                        <div className="text-sm font-medium">{log.action_type}</div>
                        <div>{getStatusBadge(log.status)}</div>
                      </TableCell>
                      <TableCell className="space-y-1">
                        <div className="text-sm font-medium capitalize">{log.entity_type}</div>
                        {log.entity_name && (
                          <div className="text-xs text-muted-foreground line-clamp-2">{log.entity_name}</div>
                        )}
                      </TableCell>
                      <TableCell className="space-y-1">
                        <div className="text-sm font-medium">{log.actor_name || 'Utilisateur inconnu'}</div>
                        <div className="text-xs text-muted-foreground">{log.actor_email || '—'}</div>
                        {log.actor_role && (
                          <Badge variant="secondary" className="text-xs">{log.actor_role}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="space-y-2">
                        {log.note && (
                          <p className="text-sm text-muted-foreground">{log.note}</p>
                        )}
                        {metadataEntries.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {metadataEntries.map(({ key, value }) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{relativeDate}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString('fr-FR')}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={page > 1 ? buildPageHref(searchParams, page - 1) : '#'}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1
                  const isActive = pageNumber === page
                  if (totalPages > 7) {
                    const isEdge = pageNumber === 1 || pageNumber === totalPages
                    const isNear = Math.abs(pageNumber - page) <= 1
                    if (!isEdge && !isNear) {
                      return null
                    }
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink href={buildPageHref(searchParams, pageNumber)} isActive={isActive}>
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    href={page < totalPages ? buildPageHref(searchParams, page + 1) : '#'}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function buildPageHref(params: ActivityPageSearchParams, page: number) {
  const url = new URL('/dashboard/admin/activity', 'https://placeholder.local')

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v) url.searchParams.append(key, v)
      })
    } else if (value) {
      url.searchParams.set(key, value)
    }
  })

  url.searchParams.set('page', String(page))

  return url.pathname + url.search
}
