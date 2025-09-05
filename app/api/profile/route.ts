import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Parse the request body
    const requestBody = await request.json()
    const { targetUserId, ...updates } = requestBody
    const profileIdToUpdate = targetUserId || user.id

    // Validate and sanitize the updates
    const allowedFields = ['full_name', 'phone', 'date_of_birth', 'country_id', 'series_id', 'avatar_url']
    const sanitizedUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        let value = updates[key]
        
        // Handle empty strings for date fields - convert to null
        if (key === 'date_of_birth' && value === '') {
          value = null
        }
        
        // Handle empty strings for other optional fields
        if ((key === 'phone' || key === 'avatar_url' || key === 'full_name') && value === '') {
          value = null
        }
        
        obj[key] = value
        return obj
      }, {})

    // Add updated_at timestamp
    sanitizedUpdates.updated_at = new Date().toISOString()

    // Get current user's profile to check permissions
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role, country_id')
      .eq('id', user.id)
      .single()

    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Check permissions for updating another user's profile
    if (profileIdToUpdate !== user.id) {
      // Regular users can only edit their own profile
      if (currentProfile.role === 'user') {
        return NextResponse.json(
          { error: 'Permission refusée - vous ne pouvez modifier que votre propre profil' },
          { status: 403 }
        )
      }

      // For members, check if target user is in same country
      if (currentProfile.role === 'member') {
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('country_id')
          .eq('id', profileIdToUpdate)
          .single()

        if (!targetProfile || targetProfile.country_id !== currentProfile.country_id) {
          return NextResponse.json(
            { error: 'Permission refusée - vous ne pouvez modifier que les profils des utilisateurs de votre pays' },
            { status: 403 }
          )
        }
      }
      // Admins can update any profile (no additional check needed)
    }

    // Get target profile to check role restrictions
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role, country_id')
      .eq('id', profileIdToUpdate)
      .single()

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Profil cible non trouvé' },
        { status: 404 }
      )
    }

    // Apply role-based restrictions
    if (targetProfile.role === 'member' && sanitizedUpdates.country_id && currentProfile.role !== 'admin') {
      // Members cannot change their country (unless updated by admin)
      delete sanitizedUpdates.country_id
    }

    if (targetProfile.role !== 'user' && sanitizedUpdates.series_id) {
      // Only users (students) can have a series
      delete sanitizedUpdates.series_id
    }

    // Validate country and series relationship
    if (sanitizedUpdates.country_id && sanitizedUpdates.series_id) {
      const { data: series } = await supabase
        .from('series')
        .select('country_id')
        .eq('id', sanitizedUpdates.series_id)
        .single()

      if (!series || series.country_id !== sanitizedUpdates.country_id) {
        return NextResponse.json(
          { error: 'La série sélectionnée n\'appartient pas au pays choisi' },
          { status: 400 }
        )
      }
    }

    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update(sanitizedUpdates)
      .eq('id', profileIdToUpdate)
      .select(`
        *,
        country:countries(*),
        series:series(*)
      `)
      .single()

    if (error) {
      console.error('Profile update error:', error)
      
      // Provide specific error messages for common issues
      let errorMessage = 'Erreur lors de la mise à jour du profil'
      
      if (error.code === '22007') {
        errorMessage = 'Format de date invalide. Veuillez vérifier la date de naissance.'
      } else if (error.code === '23505') {
        errorMessage = 'Cette information existe déjà dans le système.'
      } else if (error.code === '23503') {
        errorMessage = 'Référence invalide. Veuillez vérifier les pays et séries sélectionnés.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      profile: data,
      message: 'Profil mis à jour avec succès' 
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Get user profile with details
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        country:countries(*),
        series:series(*)
      `)
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
