import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopicNotes } from "@/components/student/topic-notes"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export default async function StudentNotesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect("/auth/signin")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, series_id, series:series(name)")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/auth/onboarding")
  }

  const { data: topics } = await supabase
    .from("topics")
    .select("id, name, series_id, subject:subjects(name)")
    .or(`series_id.eq.${profile.series_id},series_id.is.null`)
    .order("name")

  const topicOptions = (topics || []).map((topic: any) => ({
    id: topic.id,
    name: topic.name,
    subjectName: topic.subject?.name ?? null,
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium uppercase text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Notes et flashcards
          </div>
          <h1 className="text-3xl font-bold">Mes notes</h1>
          <p className="text-sm text-muted-foreground">
            Capturez vos resumés et creez des flashcards par theme.
          </p>
        </div>
        <Badge variant="outline">{profile.series?.name ?? "Serie"}</Badge>
      </div>

      {topicOptions.length > 0 ? (
        <TopicNotes topics={topicOptions} />
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Aucun theme disponible</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Les themes seront disponibles des que les cours seront associes a votre serie.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
