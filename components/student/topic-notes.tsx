"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Autocomplete, AutocompleteOption } from "@/components/ui/autocomplete"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type TopicOption = {
  id: string
  name: string
  subjectName?: string | null
}

type Flashcard = {
  id: string
  front: string
  back: string
}

type TopicNotes = {
  notes: string
  flashcards: Flashcard[]
}

type NotesStore = Record<string, TopicNotes>

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `card-${Date.now()}-${Math.round(Math.random() * 1000)}`
}

export function TopicNotes({ topics }: { topics: TopicOption[] }) {
  const storageKey = "afribac.topic-notes"
  const [store, setStore] = useState<NotesStore>({})
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(topics[0]?.id ?? null)
  const [newFront, setNewFront] = useState("")
  const [newBack, setNewBack] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as NotesStore
      setStore(parsed)
    } catch {
      setStore({})
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(storageKey, JSON.stringify(store))
  }, [store])

  const topicOptions: AutocompleteOption[] = topics.map((topic) => ({
    value: topic.id,
    label: topic.name,
    hint: topic.subjectName ?? undefined,
  }))

  const currentNotes = useMemo(() => {
    if (!selectedTopicId) return { notes: "", flashcards: [] }
    return store[selectedTopicId] || { notes: "", flashcards: [] }
  }, [selectedTopicId, store])

  const updateNotes = (value: string) => {
    if (!selectedTopicId) return
    setStore((prev) => ({
      ...prev,
      [selectedTopicId]: {
        ...currentNotes,
        notes: value,
      },
    }))
  }

  const addFlashcard = () => {
    if (!selectedTopicId || !newFront.trim() || !newBack.trim()) return
    const nextCard: Flashcard = {
      id: createId(),
      front: newFront.trim(),
      back: newBack.trim(),
    }
    setStore((prev) => ({
      ...prev,
      [selectedTopicId]: {
        ...currentNotes,
        flashcards: [nextCard, ...currentNotes.flashcards],
      },
    }))
    setNewFront("")
    setNewBack("")
  }

  const removeCard = (cardId: string) => {
    if (!selectedTopicId) return
    setStore((prev) => ({
      ...prev,
      [selectedTopicId]: {
        ...currentNotes,
        flashcards: currentNotes.flashcards.filter((card) => card.id !== cardId),
      },
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choisir un theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Autocomplete
            value={selectedTopicId}
            onChange={(value) => setSelectedTopicId(value)}
            options={topicOptions}
            placeholder="Selectionner un theme"
            searchPlaceholder="Rechercher un theme..."
            emptyText="Aucun theme trouve"
          />
          <p className="text-xs text-muted-foreground">
            Vos notes sont enregistrées localement sur cet appareil.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={currentNotes.notes}
            onChange={(event) => updateNotes(event.target.value)}
            placeholder="Ecrivez vos notes pour ce theme..."
            className="min-h-[200px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Flashcards</CardTitle>
          <Badge variant="secondary">{currentNotes.flashcards.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Recto (question, notion, formule)"
              value={newFront}
              onChange={(event) => setNewFront(event.target.value)}
            />
            <Input
              placeholder="Verso (reponse, explication)"
              value={newBack}
              onChange={(event) => setNewBack(event.target.value)}
            />
          </div>
          <Button onClick={addFlashcard}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter la carte
          </Button>

          {currentNotes.flashcards.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {currentNotes.flashcards.map((card) => (
                <Card key={card.id} className="border-muted-foreground/10 bg-muted/10">
                  <CardContent className="space-y-2 p-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Recto</p>
                      <p className="font-medium">{card.front}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Verso</p>
                      <p>{card.back}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => removeCard(card.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Ajoutez votre premiere flashcard pour demarrer.
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
