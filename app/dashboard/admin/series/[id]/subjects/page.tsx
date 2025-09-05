import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { SeriesSubjectsManager } from '@/components/forms/series-subjects-manager'

interface SeriesSubjectsPageProps {
  params: {
    id: string
  }
}

export default async function SeriesSubjectsPage({ params }: SeriesSubjectsPageProps) {
  const supabase = await createClient()

  // Check authentication and role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get series with detailed information
  const { data: series, error: seriesError } = await supabase
    .from('series')
    .select(`
      *,
      country:countries(*)
    `)
    .eq('id', params.id)
    .single()

  if (seriesError || !series) {
    notFound()
  }

  // Get all subjects
  const { data: allSubjects } = await supabase
    .from('subjects')
    .select('*')
    .order('name')

  // Get current series-subject associations
  const { data: currentAssociations } = await supabase
    .from('series_subjects')
    .select(`
      subject_id,
      coefficient,
      subject:subjects(*)
    `)
    .eq('series_id', params.id)

  // Prepare data for the manager component
  const associationMap = new Map()
  currentAssociations?.forEach(assoc => {
    associationMap.set(assoc.subject_id, { coefficient: assoc.coefficient })
  })

  const subjectAssociations = allSubjects?.map(subject => ({
    subject,
    isAssociated: associationMap.has(subject.id),
    coefficient: associationMap.get(subject.id)?.coefficient || 1
  })) || []

  const associatedCount = subjectAssociations.filter(s => s.isAssociated).length
  const availableCount = subjectAssociations.filter(s => !s.isAssociated).length

  return (
    <>
      <title>Associer matières - Série {series.name} - Afribac</title>
      
      <div className="container mx-auto py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/admin/series/${series.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la série
            </Link>
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">
                  Associer matières à "{series.name}"
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {series.country.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {associatedCount} matière{associatedCount !== 1 ? 's' : ''} associée{associatedCount !== 1 ? 's' : ''} • 
                    {availableCount} disponible{availableCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des matières</CardTitle>
            <CardDescription>
              Sélectionnez les matières pour cette série et définissez leurs coefficients académiques.
              Les coefficients déterminent l'importance de chaque matière dans les évaluations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SeriesSubjectsManager 
              seriesId={series.id}
              initialSubjects={subjectAssociations}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
