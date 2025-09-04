"use client"

import { useState } from "react"
import { Search, Filter, BookOpen, Clock, Users, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CourseCard } from "./course-card"

interface Course {
  id: string
  title: string
  subject: string
  description: string
  duration: string
  studentsCount: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  progress?: number
  rating: number
  isCompleted?: boolean
  tags: string[]
  series: string
}

interface CourseSearchProps {
  courses?: Course[]
  onCourseSelect?: (course: Course) => void
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Mathématiques Avancées",
    subject: "Mathématiques",
    description: "Calcul différentiel et intégral pour la série S. Comprend les fonctions, limites, dérivées et intégrales.",
    duration: "2h 30min",
    studentsCount: 1234,
    difficulty: "Advanced",
    progress: 75,
    rating: 4.8,
    tags: ["Analyse", "Dérivées", "Intégrales"],
    series: "S1"
  },
  {
    id: "2", 
    title: "Physique Mécanique",
    subject: "Physique",
    description: "Étude des forces, mouvement et énergie. Bases de la mécanique classique.",
    duration: "1h 45min",
    studentsCount: 987,
    difficulty: "Intermediate",
    progress: 0,
    rating: 4.6,
    tags: ["Mécanique", "Forces", "Énergie"],
    series: "S1"
  },
  {
    id: "3",
    title: "Chimie Organique",
    subject: "Chimie",
    description: "Introduction aux molécules organiques et leurs réactions.",
    duration: "2h 15min",
    studentsCount: 756,
    difficulty: "Intermediate",
    progress: 45,
    rating: 4.7,
    tags: ["Organique", "Molécules", "Réactions"],
    series: "S1"
  },
  {
    id: "4",
    title: "Littérature Française",
    subject: "Français",
    description: "Analyse des œuvres classiques et contemporaines. Techniques d'analyse littéraire.",
    duration: "3h 15min",
    studentsCount: 1156,
    difficulty: "Beginner",
    progress: 100,
    rating: 4.9,
    isCompleted: true,
    tags: ["Littérature", "Analyse", "Classique"],
    series: "L"
  }
]

export function CourseSearch({ courses = mockCourses, onCourseSelect }: CourseSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedSeries, setSelectedSeries] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("rating")

  // Extract unique values for filters
  const subjects = Array.from(new Set(courses.map(c => c.subject)))
  const series = Array.from(new Set(courses.map(c => c.series)))
  const allTags = Array.from(new Set(courses.flatMap(c => c.tags)))

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesSubject = selectedSubject === "all" || course.subject === selectedSubject
      const matchesSeries = selectedSeries === "all" || course.series === selectedSeries
      const matchesDifficulty = selectedDifficulty === "all" || course.difficulty === selectedDifficulty
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => course.tags.includes(tag))

      return matchesSearch && matchesSubject && matchesSeries && matchesDifficulty && matchesTags
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "popularity":
          return b.studentsCount - a.studentsCount
        case "difficulty":
          const difficultyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 }
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
        case "alphabetical":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedSubject("all")
    setSelectedSeries("all")
    setSelectedDifficulty("all")
    setSelectedTags([])
    setSortBy("rating")
  }

  const activeFiltersCount = [
    selectedSubject !== "all",
    selectedSeries !== "all", 
    selectedDifficulty !== "all",
    selectedTags.length > 0
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher des cours, matières ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtres</h4>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Effacer tout
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Matière</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les matières</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Série</Label>
                    <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les séries</SelectItem>
                        {series.map(serie => (
                          <SelectItem key={serie} value={serie}>Série {serie}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Difficulté</Label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les difficultés</SelectItem>
                        <SelectItem value="Beginner">Débutant</SelectItem>
                        <SelectItem value="Intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="Advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Tags</Label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {allTags.map(tag => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={tag}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={() => handleTagToggle(tag)}
                          />
                          <Label htmlFor={tag} className="text-sm cursor-pointer">
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Sort and Results Count */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredCourses.length} cours trouvé{filteredCourses.length !== 1 ? 's' : ''}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Mieux notés
                </div>
              </SelectItem>
              <SelectItem value="popularity">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Plus populaires
                </div>
              </SelectItem>
              <SelectItem value="difficulty">Difficulté</SelectItem>
              <SelectItem value="alphabetical">Alphabétique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {(selectedTags.length > 0 || selectedSubject !== "all" || selectedSeries !== "all" || selectedDifficulty !== "all") && (
          <div className="flex flex-wrap gap-2">
            {selectedSubject !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {selectedSubject}
                <button onClick={() => setSelectedSubject("all")} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            )}
            {selectedSeries !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Série {selectedSeries}
                <button onClick={() => setSelectedSeries("all")} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            )}
            {selectedDifficulty !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {selectedDifficulty}
                <button onClick={() => setSelectedDifficulty("all")} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            )}
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => handleTagToggle(tag)} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun cours trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Effacer les filtres
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              title={course.title}
              subject={course.subject}
              description={course.description}
              duration={course.duration}
              studentsCount={course.studentsCount}
              difficulty={course.difficulty}
              progress={course.progress}
              rating={course.rating}
              isCompleted={course.isCompleted}
              onClick={() => onCourseSelect?.(course)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
