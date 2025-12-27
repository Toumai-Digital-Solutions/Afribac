import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema
const applicationSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide').max(20),
  country: z.string().min(2, 'Veuillez sélectionner un pays'),
  profession: z.string().min(2, 'Veuillez préciser votre profession'),
  speciality: z.string().optional(),
  notes: z.string().max(1000, 'Maximum 1000 caractères').optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = applicationSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation échouée', 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const supabase = await createClient()

    // Check if email already exists
    const { data: existing } = await supabase
      .from('partner_applications')
      .select('id')
      .eq('email', data.email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Une candidature avec cet email existe déjà' },
        { status: 409 }
      )
    }

    // Insert application
    const { error: insertError } = await supabase
      .from('partner_applications')
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        profession: data.profession,
        speciality: data.speciality || null,
        message: data.notes || null
      })

    if (insertError) {
      console.error('Error inserting partner application:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement de votre candidature' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Votre candidature a été enregistrée avec succès' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Partner application error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
