"use client"

import * as React from "react"
import { useState } from "react"
import {
  Calendar,
  CheckSquare,
  ChevronRight,
  CircuitBoard,
  File,
  Home,
  Layers,
  Settings,
  Users,
  Star,
  Heart,
  MessageSquare,
  Bell,
  Search,
  Mail,
  Phone,
  MapPin,
  Clock,
  Download,
  Upload,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  TrendingUp,
  BarChart3,
} from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Toggle } from "@/components/ui/toggle"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Educational Components
import { CourseCard } from "@/components/educational/course-card"
import { QuizQuestion } from "@/components/educational/quiz-question"
import { ProgressDashboard } from "@/components/educational/progress-dashboard"
import { CourseSearch } from "@/components/educational/course-search"
import { PDFViewer } from "@/components/educational/pdf-viewer"
import { ExamSimulation } from "@/components/educational/exam-simulation"

// Dashboard Components
import { StudentDashboard } from "@/components/dashboards/student-dashboard"
import { MemberDashboard } from "@/components/dashboards/member-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"

// Form Components
import { FileUpload } from "@/components/forms/file-upload"
import { CourseFormSimple } from "@/components/forms/course-form-simple"

// Table Components
import { DataTable } from "@/components/tables/data-table"

// Chart Components
import { AnalyticsChart, sampleData } from "@/components/charts/analytics-chart"

// UI Components
import { Notification, useNotifications, NotificationContainer } from "@/components/ui/notification"

// Additional Educational Components
import { LearningStats } from "@/components/educational/learning-stats"

const ComponentSection = ({ 
  title, 
  description, 
  children 
}: { 
  title: string
  description?: string
  children: React.ReactNode 
}) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
    <div className="grid gap-6">
      {children}
    </div>
  </div>
)

const ComponentDemo = ({ 
  title, 
  description, 
  children 
}: { 
  title: string
  description?: string
  children: React.ReactNode 
}) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-4">
      {children}
    </CardContent>
  </Card>
)

export default function ComponentsPage() {
  const [sliderValue, setSliderValue] = useState([50])
  const [progressValue, setProgressValue] = useState(65)
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Navigation items for the sidebar
  const navigationItems = [
    { id: "educational", label: "Educational", icon: BookOpen },
    { id: "dashboards", label: "Dashboards", icon: TrendingUp },
    { id: "charts", label: "Charts & Analytics", icon: BarChart3 },
    { id: "forms", label: "Forms & Upload", icon: File },
    { id: "data-tables", label: "Data Tables", icon: Users },
    { id: "buttons", label: "Buttons", icon: CircuitBoard },
    { id: "navigation", label: "Navigation", icon: Home },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "overlays", label: "Overlays", icon: Layers },
    { id: "data-display", label: "Data Display", icon: CheckSquare },
    { id: "layout", label: "Layout", icon: Settings },
  ]

  const [activeSection, setActiveSection] = useState("educational")

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <CircuitBoard className="h-6 w-6" />
            <h1 className="text-lg font-semibold">Afribac Components</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r bg-muted/20 p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-6xl space-y-12">
            
            {/* Educational Components Section */}
            {activeSection === "educational" && (
              <ComponentSection 
                title="Educational Components" 
                description="Specialized components designed for the African educational platform."
              >
                <ComponentDemo title="Course Cards" description="Interactive course display with progress tracking">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <CourseCard
                      title="Mathématiques Avancées"
                      subject="Mathématiques"
                      description="Calcul différentiel et intégral pour la série S. Comprend les fonctions, limites, dérivées et intégrales avec applications pratiques."
                      duration="2h 30min"
                      studentsCount={1234}
                      difficulty="Advanced"
                      progress={75}
                      rating={4.8}
                    />
                    <CourseCard
                      title="Physique Mécanique"
                      subject="Physique"
                      description="Étude des forces, mouvement et énergie. Bases de la mécanique classique avec exercices d'application."
                      duration="1h 45min"
                      studentsCount={987}
                      difficulty="Intermediate"
                      progress={0}
                      rating={4.6}
                    />
                    <CourseCard
                      title="Littérature Française"
                      subject="Français"
                      description="Analyse des œuvres classiques et contemporaines. Développement des compétences en analyse littéraire."
                      duration="3h 15min"
                      studentsCount={756}
                      difficulty="Beginner"
                      progress={100}
                      rating={4.9}
                      isCompleted={true}
                    />
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Quiz Question" description="Interactive quiz component with explanations">
                  <div className="max-w-2xl mx-auto">
                    <QuizQuestion
                      question="Quelle est la dérivée de la fonction f(x) = x² + 3x - 2 ?"
                      options={[
                        "f'(x) = 2x + 3",
                        "f'(x) = x + 3",
                        "f'(x) = 2x - 3",
                        "f'(x) = x² + 3"
                      ]}
                      correctAnswer={0}
                      explanation="La dérivée de x² est 2x, la dérivée de 3x est 3, et la dérivée d'une constante est 0. Donc f'(x) = 2x + 3."
                      questionNumber={1}
                      totalQuestions={10}
                      timeLimit={120}
                    />
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Progress Dashboard" description="Comprehensive learning progress tracking">
                  <ProgressDashboard
                    subjects={[
                      { name: "Mathématiques", progress: 85, timeSpent: 12.5, coursesCompleted: 8, totalCourses: 10 },
                      { name: "Physique", progress: 60, timeSpent: 8.2, coursesCompleted: 5, totalCourses: 8 },
                      { name: "Chimie", progress: 45, timeSpent: 6.1, coursesCompleted: 3, totalCourses: 7 },
                      { name: "Français", progress: 90, timeSpent: 15.3, coursesCompleted: 9, totalCourses: 10 },
                      { name: "Histoire", progress: 30, timeSpent: 4.2, coursesCompleted: 2, totalCourses: 6 }
                    ]}
                    overallProgress={68}
                    totalTimeSpent={46.3}
                    achievementsUnlocked={12}
                    weeklyGoal={15}
                    weeklyProgress={11.2}
                  />
                </ComponentDemo>

                <ComponentDemo title="Course Search" description="Advanced course search and filtering">
                  <CourseSearch />
                </ComponentDemo>

                <ComponentDemo title="PDF Viewer" description="Interactive PDF viewer with bookmarks and controls">
                  <PDFViewer
                    pdfUrl="/sample.pdf"
                    title="Cours de Mathématiques - Analyse"
                    totalPages={24}
                    bookmarks={[3, 7, 15, 21]}
                  />
                </ComponentDemo>

                <ComponentDemo title="Learning Statistics" description="Advanced learning analytics and progress tracking">
                  <LearningStats
                    timeSpent={12.5}
                    coursesCompleted={8}
                    quizScore={84}
                    streak={12}
                    weeklyGoal={15}
                    weeklyProgress={12.5}
                  />
                </ComponentDemo>

                <ComponentDemo title="Exam Simulation" description="Full-screen exam simulation interface">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/30 p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Simulation d'examen en mode plein écran
                      </p>
                      <Button className="mt-2" onClick={() => {
                        // In real app, this would open in a new window/fullscreen
                        alert("Mode examen simulé - ouvrirait en plein écran dans l'app réelle")
                      }}>
                        Lancer la simulation
                      </Button>
                    </div>
                  </div>
                </ComponentDemo>
              </ComponentSection>
            )}

            {/* Dashboards Section */}
            {activeSection === "dashboards" && (
              <ComponentSection 
                title="Dashboards" 
                description="Role-specific dashboards for students, members, and admins."
              >
                <ComponentDemo title="Student Dashboard" description="Comprehensive student learning dashboard">
                  <StudentDashboard
                    studentName="Aminata Diallo"
                    country="Sénégal"
                    series="S2"
                  />
                </ComponentDemo>

                <ComponentDemo title="Member Dashboard" description="Local content management dashboard">
                  <MemberDashboard
                    memberName="Dr. Fatou Sarr"
                    country="Sénégal"
                    countryCode="SN"
                  />
                </ComponentDemo>

                <ComponentDemo title="Admin Dashboard" description="Global platform administration dashboard">
                  <AdminDashboard
                    adminName="Moussa Konaté"
                  />
                </ComponentDemo>
              </ComponentSection>
            )}

            {/* Charts & Analytics Section */}
            {activeSection === "charts" && (
              <ComponentSection 
                title="Charts & Analytics" 
                description="Interactive charts and analytics components for data visualization."
              >
                <ComponentDemo title="Learning Statistics" description="Comprehensive learning analytics with charts and goals">
                  <LearningStats
                    timeSpent={8.5}
                    coursesCompleted={3}
                    quizScore={78}
                    streak={7}
                    weeklyGoal={15}
                    weeklyProgress={8.5}
                  />
                </ComponentDemo>

                <ComponentDemo title="Analytics Charts" description="Various chart types for data visualization">
                  <div className="grid gap-6 md:grid-cols-2">
                    <AnalyticsChart
                      title="Engagement par pays"
                      description="Nombre d'utilisateurs actifs"
                      data={sampleData.countryEngagement}
                      type="bar"
                      height={250}
                      showTrend
                      trendValue={8.3}
                    />
                    
                    <AnalyticsChart
                      title="Progression mensuelle"
                      description="Évolution des scores (%)"
                      data={sampleData.monthlyProgress}
                      type="line"
                      height={250}
                      showTrend
                      trendValue={-2.1}
                    />
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Notifications" description="Toast notifications for user feedback">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Notification
                        title="Cours sauvegardé"
                        description="Votre cours a été enregistré avec succès"
                        variant="success"
                        duration={0}
                      />
                      <Notification
                        title="Attention requise"
                        description="Veuillez vérifier vos informations"
                        variant="warning"
                        duration={0}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Notification
                        title="Erreur de connexion"
                        description="Impossible de se connecter au serveur"
                        variant="error"
                        duration={0}
                      />
                      <Notification
                        title="Nouvelle fonctionnalité"
                        description="Découvrez le mode examen simulé"
                        variant="info"
                        duration={0}
                      />
                    </div>
                  </div>
                </ComponentDemo>
              </ComponentSection>
            )}

            {/* Forms & Upload Section */}
            {activeSection === "forms" && (
              <ComponentSection 
                title="Forms & File Upload" 
                description="Advanced forms and file upload components for content creation."
              >
                <ComponentDemo title="File Upload" description="Drag & drop file upload with validation">
                  <FileUpload
                    accept=".pdf,.doc,.docx,.txt"
                    maxSize={10}
                    maxFiles={3}
                    onFileSelect={(files) => console.log("Files selected:", files)}
                  />
                </ComponentDemo>

                <ComponentDemo title="Course Creation Form" description="Complete course creation form with validation">
                  <CourseFormSimple
                    onSubmit={async (data) => {
                      console.log("Course data:", data)
                      // Simulate API call
                      await new Promise(resolve => setTimeout(resolve, 2000))
                    }}
                  />
                </ComponentDemo>
              </ComponentSection>
            )}

            {/* Data Tables Section */}
            {activeSection === "data-tables" && (
              <ComponentSection 
                title="Data Tables" 
                description="Advanced data tables with filtering, sorting, and pagination."
              >
                <ComponentDemo title="Users Management Table" description="Complete data table for managing users">
                  <DataTable
                    title="Gestion des Utilisateurs"
                    description="Table complète avec recherche, filtres et pagination"
                    columns={[
                      {
                        accessorKey: "name",
                        header: "Nom",
                        cell: ({ row }) => (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                              {row.getValue<string>("name").split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="font-medium">{row.getValue("name")}</span>
                          </div>
                        ),
                      },
                      {
                        accessorKey: "email",
                        header: "Email",
                      },
                      {
                        accessorKey: "role",
                        header: "Rôle",
                        cell: ({ row }) => (
                          <Badge variant={
                            row.getValue("role") === "admin" ? "destructive" :
                            row.getValue("role") === "member" ? "warning" : "secondary"
                          }>
                            {row.getValue("role")}
                          </Badge>
                        ),
                      },
                      {
                        accessorKey: "country",
                        header: "Pays",
                      },
                      {
                        accessorKey: "series",
                        header: "Série",
                        cell: ({ row }) => (
                          <Badge variant="outline">{row.getValue("series")}</Badge>
                        ),
                      },
                      {
                        accessorKey: "status",
                        header: "Statut",
                        cell: ({ row }) => (
                          <Badge variant={row.getValue("status") === "active" ? "success" : "secondary"}>
                            {row.getValue("status")}
                          </Badge>
                        ),
                      },
                    ]}
                    data={[
                      { name: "Aminata Diallo", email: "aminata@email.com", role: "user", country: "Sénégal", series: "S2", status: "active" },
                      { name: "Ousmane Traoré", email: "ousmane@email.com", role: "user", country: "Mali", series: "S1", status: "active" },
                      { name: "Dr. Fatou Sarr", email: "fatou@email.com", role: "member", country: "Sénégal", series: "", status: "active" },
                      { name: "Moussa Konaté", email: "moussa@email.com", role: "admin", country: "Global", series: "", status: "active" },
                      { name: "Fatoumata Kane", email: "fatoumata@email.com", role: "user", country: "Burkina Faso", series: "L", status: "inactive" },
                    ]}
                    searchable
                    filterable
                    filterColumn="role"
                    filterOptions={[
                      { label: "Étudiants", value: "user" },
                      { label: "Members", value: "member" },
                      { label: "Admins", value: "admin" },
                    ]}
                  />
                </ComponentDemo>
              </ComponentSection>
            )}
            
            {/* Buttons Section */}
            {activeSection === "buttons" && (
              <ComponentSection 
                title="Buttons" 
                description="Different button variants and states for various use cases."
              >
                <ComponentDemo title="Button Variants" description="All button variants including educational colors">
                  <div className="flex flex-wrap gap-3">
                    <Button>Primary Button</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Button Sizes" description="Different sizes for different contexts">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Button States" description="Loading and disabled states">
                  <div className="flex flex-wrap gap-3">
                    <Button disabled>Disabled</Button>
                    <Button>
                      <Mail className="mr-2 h-4 w-4" />
                      Login with Email
                    </Button>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </ComponentDemo>
              </ComponentSection>
            )}

            {/* Forms Section */}
            {activeSection === "forms" && (
              <ComponentSection 
                title="Form Elements" 
                description="Input fields, selectors, and other form components."
              >
                <ComponentDemo title="Input Fields" description="Text inputs with different states">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" placeholder="Enter your password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="disabled">Disabled Input</Label>
                      <Input id="disabled" disabled placeholder="Disabled input" />
                    </div>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Textarea" description="Multi-line text input">
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Type your message here..." />
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Select" description="Dropdown selection component">
                  <div className="space-y-2">
                    <Label>Select Country</Label>
                    <Select>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="senegal">Sénégal</SelectItem>
                        <SelectItem value="cotedivoire">Côte d'Ivoire</SelectItem>
                        <SelectItem value="mali">Mali</SelectItem>
                        <SelectItem value="burkinafaso">Burkina Faso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Checkbox & Radio" description="Selection controls">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Checkboxes</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="terms" />
                          <Label htmlFor="terms">Accept terms and conditions</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="marketing" />
                          <Label htmlFor="marketing">Receive marketing emails</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Radio Group</Label>
                      <RadioGroup defaultValue="option-one">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option-one" id="option-one" />
                          <Label htmlFor="option-one">Option One</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option-two" id="option-two" />
                          <Label htmlFor="option-two">Option Two</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Switch & Slider" description="Toggle and range controls">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Switch id="airplane-mode" />
                      <Label htmlFor="airplane-mode">Airplane Mode</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Volume: {sliderValue[0]}</Label>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                        className="w-[200px]"
                      />
                    </div>
                  </div>
                </ComponentDemo>
              </ComponentSection>
            )}

            {/* Navigation Section */}
            {activeSection === "navigation" && (
              <ComponentSection 
                title="Navigation" 
                description="Components for navigation and routing."
              >
                <ComponentDemo title="Tabs" description="Tabbed interface for content organization">
                  <Tabs defaultValue="account" className="w-[400px]">
                    <TabsList>
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="password">Password</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue="Pedro Duarte" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="@peduarte" />
                      </div>
                    </TabsContent>
                    <TabsContent value="password" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current">Current password</Label>
                        <Input id="current" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new">New password</Label>
                        <Input id="new" type="password" />
                      </div>
                    </TabsContent>
                    <TabsContent value="settings" className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Manage your account settings and preferences.
                      </p>
                    </TabsContent>
                  </Tabs>
                </ComponentDemo>

                <ComponentDemo title="Dropdown Menu" description="Context menus and actions">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Open Menu</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Support</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ComponentDemo>

                <ComponentDemo title="Toggle Groups" description="Grouped toggle buttons">
                  <div className="space-y-4">
                    <ToggleGroup type="single" defaultValue="bold">
                      <ToggleGroupItem value="bold" aria-label="Toggle bold">
                        <strong>B</strong>
                      </ToggleGroupItem>
                      <ToggleGroupItem value="italic" aria-label="Toggle italic">
                        <em>I</em>
                      </ToggleGroupItem>
                      <ToggleGroupItem value="underline" aria-label="Toggle underline">
                        <u>U</u>
                      </ToggleGroupItem>
                    </ToggleGroup>

                    <ToggleGroup type="multiple">
                      <ToggleGroupItem value="bold">
                        <Heart className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="italic">
                        <Star className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="underline">
                        <Bell className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </ComponentDemo>
              </ComponentSection>
            )}

            {/* Feedback Section */}
            {activeSection === "feedback" && (
              <ComponentSection 
                title="Feedback" 
                description="Components for displaying status and user feedback."
              >
                <ComponentDemo title="Alerts" description="Important messages and notifications">
                  <div className="space-y-4">
                    <Alert>
                      <MessageSquare className="h-4 w-4" />
                      <AlertTitle>Heads up!</AlertTitle>
                      <AlertDescription>
                        You can add components to your app using the cli.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Your session has expired. Please log in again.
                      </AlertDescription>
                    </Alert>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Progress" description="Progress indicators">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progressValue}%</span>
                      </div>
                      <Progress value={progressValue} className="w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Badges" description="Status indicators and labels">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Error</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Skeleton Loading" description="Loading placeholders">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                    <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                  </div>
                </ComponentDemo>
              </ComponentSection>
            )}

            {/* Overlays Section */}
            {activeSection === "overlays" && (
              <ComponentSection 
                title="Overlays" 
                description="Modal dialogs, popups, and overlay components."
              >
                <ComponentDemo title="Dialog" description="Modal dialogs for user interactions">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                          Make changes to your profile here. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right">
                            Username
                          </Label>
                          <Input id="username" defaultValue="@peduarte" className="col-span-3" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </ComponentDemo>

                <ComponentDemo title="Alert Dialog" description="Important confirmations and alerts">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </ComponentDemo>

                <ComponentDemo title="Popover" description="Contextual popup content">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Open Popover</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Dimensions</h4>
                          <p className="text-sm text-muted-foreground">
                            Set the dimensions for the layer.
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="width">Width</Label>
                            <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="maxWidth">Max. width</Label>
                            <Input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="height">Height</Label>
                            <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="maxHeight">Max. height</Label>
                            <Input id="maxHeight" defaultValue="none" className="col-span-2 h-8" />
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </ComponentDemo>

                <ComponentDemo title="Tooltip" description="Helpful hints and information">
                  <TooltipProvider>
                    <div className="flex gap-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline">Hover me</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add to library</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add new item</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </ComponentDemo>

                <ComponentDemo title="Hover Card" description="Rich hover content">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="link">@nextjs</Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar>
                          <AvatarImage src="https://github.com/vercel.png" />
                          <AvatarFallback>VC</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">@nextjs</h4>
                          <p className="text-sm">
                            The React Framework – created and maintained by @vercel.
                          </p>
                          <div className="flex items-center pt-2">
                            <CalendarComponent className="mr-2 h-4 w-4 opacity-70" />{" "}
                            <span className="text-xs text-muted-foreground">
                              Joined December 2021
                            </span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </ComponentDemo>
              </ComponentSection>
            )}

            {/* Data Display Section */}
            {activeSection === "data-display" && (
              <ComponentSection 
                title="Data Display" 
                description="Components for displaying structured data and content."
              >
                <ComponentDemo title="Avatar" description="User profile pictures and initials">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarImage src="" alt="@johndoe" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>
                        <Users className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Table" description="Structured data display">
                  <Table>
                    <TableCaption>A list of recent students</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Series</TableHead>
                        <TableHead className="text-right">Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">001</TableCell>
                        <TableCell>Aminata Diallo</TableCell>
                        <TableCell>Sénégal</TableCell>
                        <TableCell>S2</TableCell>
                        <TableCell className="text-right">85%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">002</TableCell>
                        <TableCell>Kouame Yves</TableCell>
                        <TableCell>Côte d'Ivoire</TableCell>
                        <TableCell>S1</TableCell>
                        <TableCell className="text-right">72%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">003</TableCell>
                        <TableCell>Fatoumata Traoré</TableCell>
                        <TableCell>Mali</TableCell>
                        <TableCell>L</TableCell>
                        <TableCell className="text-right">91%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </ComponentDemo>

                <ComponentDemo title="Calendar" description="Date selection component">
                  <div className="flex justify-center">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                    />
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Command" description="Command palette and search">
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup heading="Suggestions">
                        <CommandItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Calendar</span>
                        </CommandItem>
                        <CommandItem>
                          <Search className="mr-2 h-4 w-4" />
                          <span>Search Emoji</span>
                        </CommandItem>
                        <CommandItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </ComponentDemo>
              </ComponentSection>
            )}

            {/* Layout Section */}
            {activeSection === "layout" && (
              <ComponentSection 
                title="Layout" 
                description="Components for structuring and organizing content layout."
              >
                <ComponentDemo title="Card" description="Flexible content containers">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Mathematics Course</CardTitle>
                        <CardDescription>
                          Advanced calculus and algebra for Series S
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            2h 30min
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-3 w-3" />
                            1,234 students
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Physics Course</CardTitle>
                        <CardDescription>
                          Mechanics and thermodynamics fundamentals
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            1h 45min
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-3 w-3" />
                            987 students
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Separator" description="Visual dividers for content">
                  <div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium leading-none">Afribac</h4>
                      <p className="text-sm text-muted-foreground">
                        Educational platform for African students.
                      </p>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex h-5 items-center space-x-4 text-sm">
                      <div>Courses</div>
                      <Separator orientation="vertical" />
                      <div>Quiz</div>
                      <Separator orientation="vertical" />
                      <div>Simulations</div>
                    </div>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Accordion" description="Collapsible content sections">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is Afribac?</AccordionTrigger>
                      <AccordionContent>
                        Afribac is an educational platform designed specifically for African students preparing for their baccalauréat exams. It provides comprehensive courses, practice questions, and exam simulations.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Which countries are supported?</AccordionTrigger>
                      <AccordionContent>
                        Currently, we support curricula from Senegal, Côte d'Ivoire, Mali, Burkina Faso, and other French-speaking African countries.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>How do I get started?</AccordionTrigger>
                      <AccordionContent>
                        Simply create an account, select your country and series, and start exploring our comprehensive library of courses and practice materials.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </ComponentDemo>

                <ComponentDemo title="Aspect Ratio" description="Maintain consistent aspect ratios">
                  <div className="w-[450px]">
                    <AspectRatio ratio={16 / 9} className="bg-muted">
                      <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                        <div className="text-center">
                          <File className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">16:9 Aspect Ratio</p>
                        </div>
                      </div>
                    </AspectRatio>
                  </div>
                </ComponentDemo>

                <ComponentDemo title="Scroll Area" description="Custom scrollable containers">
                  <ScrollArea className="h-72 w-48 rounded-md border">
                    <div className="p-4">
                      <h4 className="mb-4 text-sm font-medium leading-none">African Countries</h4>
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="text-sm">
                          Country {i + 1}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </ComponentDemo>
              </ComponentSection>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
