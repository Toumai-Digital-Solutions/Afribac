'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { FloatingParticles, GeometricShapes } from '@/components/ui/animated-background'
import {
  Users,
  Globe,
  GraduationCap,
  CheckCircle,
  ArrowRight,
  Loader2,
  BookOpen,
  Target,
  Heart,
  Mail,
  Phone,
  User,
  Briefcase,
  Sparkles
} from 'lucide-react'

interface Country {
  id: string
  name: string
  code: string
  flag_url: string
  is_supported: boolean
  display_order: number
}

const formSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  phone: z.string().min(8, 'Numéro de téléphone trop court').max(20, 'Numéro trop long'),
  country: z.string().min(1, 'Veuillez sélectionner un pays'),
  profession: z.string().min(1, 'Veuillez sélectionner votre profession'),
  speciality: z.string().optional(),
  notes: z.string().max(1000, 'Maximum 1000 caractères').optional()
})

type FormData = z.infer<typeof formSchema>

const professions = [
  { value: 'professeur_lycee', label: 'Professeur de lycée' },
  { value: 'professeur_college', label: 'Professeur de collège' },
  { value: 'directeur_etablissement', label: "Directeur d'établissement" },
  { value: 'proviseur', label: 'Proviseur' },
  { value: 'censeur', label: 'Censeur' },
  { value: 'inspecteur', label: 'Inspecteur pédagogique' },
  { value: 'conseiller_pedagogique', label: 'Conseiller pédagogique' },
  { value: 'formateur', label: 'Formateur' },
  { value: 'autre_education', label: 'Autre professionnel de l\'éducation' }
]

const benefits = [
  {
    icon: Globe,
    title: 'Impact national',
    description: 'Devenez le responsable Afribac pour votre pays et façonnez l\'avenir éducatif'
  },
  {
    icon: Users,
    title: 'Réseau professionnel',
    description: 'Rejoignez une communauté d\'éducateurs passionnés à travers l\'Afrique'
  },
  {
    icon: Target,
    title: 'Autonomie',
    description: 'Gérez les opérations de votre pays avec liberté et support'
  },
  {
    icon: Heart,
    title: 'Mission sociale',
    description: 'Contribuez à démocratiser l\'accès à une éducation de qualité'
  }
]

export default function PartnersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      country: '',
      profession: '',
      speciality: '',
      notes: ''
    }
  })

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries')
        const data = await response.json()
        if (data.countries) {
          setCountries(data.countries)
        }
      } catch (error) {
        console.error('Error fetching countries:', error)
      } finally {
        setIsLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/partner-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi')
      }

      setSubmitStatus('success')
      reset()
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <BackgroundBeams />
          <FloatingParticles />
          <GeometricShapes />

          <div className="container mx-auto text-center relative z-10">
            <AnimatedGradientText className="mb-6">
              🤝 Rejoignez notre équipe
            </AnimatedGradientText>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Devenez ambassadeur Afribac
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Nous recherchons des <strong>professeurs</strong>, <strong>directeurs</strong>, et <strong>proviseurs</strong> passionnés 
              pour prendre en charge les opérations Afribac dans leur pays et révolutionner l'éducation en Afrique.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>Professionnels de l'éducation</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border">
                <Globe className="h-4 w-4 text-primary" />
                <span>Tous pays africains</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border">
                <Users className="h-4 w-4 text-primary" />
                <span>Temps partiel ou plein</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Pourquoi nous rejoindre ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Candidature Ambassadeur</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous et nous vous contacterons rapidement
                </CardDescription>
              </CardHeader>

              <CardContent>
                {submitStatus === 'success' ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Candidature envoyée !</h3>
                    <p className="text-muted-foreground">
                      Merci pour votre intérêt ! Notre équipe examinera votre candidature
                      et vous contactera très bientôt.
                    </p>
                    <Button variant="outline" onClick={() => setSubmitStatus('idle')}>
                      Soumettre une autre candidature
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {submitStatus === 'error' && (
                      <Alert variant="destructive">
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    )}

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nom complet *
                      </Label>
                      <Input
                        id="full_name"
                        placeholder="Ex: Amadou Diallo"
                        {...register('full_name')}
                        className={errors.full_name ? 'border-destructive' : ''}
                      />
                      {errors.full_name && (
                        <p className="text-sm text-destructive">{errors.full_name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ex: amadou@email.com"
                        {...register('email')}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Ex: +221 77 123 45 67"
                        {...register('phone')}
                        className={errors.phone ? 'border-destructive' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Pays *
                      </Label>
                      <Select
                        value={watch('country')}
                        onValueChange={(value) => setValue('country', value, { shouldValidate: true })}
                        disabled={isLoadingCountries}
                      >
                        <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                          <SelectValue placeholder={isLoadingCountries ? "Chargement..." : "Sélectionnez votre pays"} />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.id} value={country.code}>
                              <span className="flex items-center gap-2">
                                <span>{country.flag_url}</span>
                                <span>{country.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                          <SelectItem value="other">
                            <span className="flex items-center gap-2">
                              <span>🌍</span>
                              <span>Autre pays africain</span>
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.country && (
                        <p className="text-sm text-destructive">{errors.country.message}</p>
                      )}
                    </div>

                    {/* Profession */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Profession *
                      </Label>
                      <Select
                        value={watch('profession')}
                        onValueChange={(value) => setValue('profession', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className={errors.profession ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Sélectionnez votre profession" />
                        </SelectTrigger>
                        <SelectContent>
                          {professions.map((profession) => (
                            <SelectItem key={profession.value} value={profession.value}>
                              {profession.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.profession && (
                        <p className="text-sm text-destructive">{errors.profession.message}</p>
                      )}
                    </div>

                    {/* Speciality (Optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="speciality" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Spécialité / Matière <span className="text-muted-foreground">(optionnel)</span>
                      </Label>
                      <Input
                        id="speciality"
                        placeholder="Ex: Mathématiques, Physique-Chimie, Français..."
                        {...register('speciality')}
                      />
                    </div>

                    {/* Notes (Optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="flex items-center gap-2">
                        Message <span className="text-muted-foreground">(optionnel)</span>
                      </Label>
                      <textarea
                        id="notes"
                        rows={4}
                        placeholder="Parlez-nous de votre motivation, votre expérience ou toute information utile..."
                        {...register('notes')}
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                      {errors.notes && (
                        <p className="text-sm text-destructive">{errors.notes.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer ma candidature
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      En soumettant ce formulaire, vous acceptez d'être contacté par l'équipe Afribac.
                      Vos données sont traitées conformément à notre politique de confidentialité.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Alternative */}
        <section className="py-16 px-4 bg-gradient-to-r from-purple-600/5 to-pink-600/5 border-t">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Des questions ?</h2>
            <p className="text-muted-foreground mb-6">
              N'hésitez pas à nous contacter directement par email
            </p>
            <Button variant="outline" asChild>
              <a href="mailto:contact@afribac.com">
                <Mail className="mr-2 h-4 w-4" />
                contact@afribac.com
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
