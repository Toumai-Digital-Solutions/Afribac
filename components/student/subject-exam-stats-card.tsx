import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Award, Calendar, Clock, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SubjectExamStatsCardProps {
  subjectName: string
  subjectColor: string | null
  subjectIcon: string | null
  totalSubmissions: number
  completedSubmissions: number
  averageScore: number | null
  bestScore: number | null
  lowestScore: number | null
  totalTimeSpentMinutes: number | null
  lastSubmissionDate: string | null
}

function formatMinutes(minutes: number | null): string {
  if (!minutes) return '0 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = minutes / 60
  return `${hours.toFixed(1)} h`
}

export function SubjectExamStatsCard({
  subjectName,
  subjectColor,
  totalSubmissions,
  completedSubmissions,
  averageScore,
  bestScore,
  lowestScore,
  totalTimeSpentMinutes,
  lastSubmissionDate
}: SubjectExamStatsCardProps) {
  const scorePercentage = averageScore ? Math.min(100, (averageScore / 20) * 100) : 0
  const completionRate = totalSubmissions > 0 ? (completedSubmissions / totalSubmissions) * 100 : 0

  return (
    <Card className="border-muted-foreground/10 bg-muted/10">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="secondary" 
            className="rounded-full"
            style={subjectColor ? { backgroundColor: `${subjectColor}20`, color: subjectColor } : {}}
          >
            {subjectName}
          </Badge>
          {subjectColor && (
            <span 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: subjectColor }} 
            />
          )}
        </div>
        <CardTitle className="text-lg">
          {averageScore ? `${averageScore.toFixed(1)}/20` : 'Aucune note'}
        </CardTitle>
        <CardDescription>
          {totalSubmissions} {totalSubmissions > 1 ? 'soumissions' : 'soumission'}
          {completedSubmissions < totalSubmissions && (
            <> · {completedSubmissions} {completedSubmissions > 1 ? 'terminées' : 'terminée'}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average Score Progress */}
        {averageScore !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Moyenne
              </span>
              <span className="font-medium">{scorePercentage.toFixed(0)}%</span>
            </div>
            <Progress value={scorePercentage} className="h-2" />
          </div>
        )}

        {/* Score Range */}
        {bestScore !== null && lowestScore !== null && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border bg-background/50 p-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Award className="h-3 w-3" />
                Meilleur
              </div>
              <div className="mt-1 font-semibold text-green-600">
                {bestScore.toFixed(1)}/20
              </div>
            </div>
            <div className="rounded-lg border bg-background/50 p-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3 rotate-180" />
                Minimum
              </div>
              <div className="mt-1 font-semibold text-orange-600">
                {lowestScore.toFixed(1)}/20
              </div>
            </div>
          </div>
        )}

        {/* Additional Stats */}
        <div className="space-y-2 border-t pt-3 text-xs text-muted-foreground">
          {totalTimeSpentMinutes !== null && totalTimeSpentMinutes > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Temps total
              </span>
              <span className="font-medium">{formatMinutes(totalTimeSpentMinutes)}</span>
            </div>
          )}
          {lastSubmissionDate && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Dernière soumission
              </span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(lastSubmissionDate), { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
