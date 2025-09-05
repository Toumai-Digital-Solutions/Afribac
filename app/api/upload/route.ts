import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string || 'avatars'
    const targetUserId = formData.get('targetUserId') as string || user.id

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Check permissions for uploading to another user's folder
    if (targetUserId !== user.id) {
      // Get current user's profile
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

      // Check if user has permission to upload for target user
      if (currentProfile.role === 'user') {
        return NextResponse.json(
          { error: 'Permission refusée - vous ne pouvez modifier que votre propre avatar' },
          { status: 403 }
        )
      }

      // For members, check if target user is in same country
      if (currentProfile.role === 'member') {
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('country_id')
          .eq('id', targetUserId)
          .single()

        if (!targetProfile || targetProfile.country_id !== currentProfile.country_id) {
          return NextResponse.json(
            { error: 'Permission refusée - vous ne pouvez modifier que les avatars des utilisateurs de votre pays' },
            { status: 403 }
          )
        }
      }
      // Admins can upload for any user (no additional check needed)
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Seules les images sont autorisées' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'L\'image ne doit pas dépasser 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename with target user folder structure
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExtension}`
    const filePath = `${targetUserId}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload du fichier' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      message: 'Fichier uploadé avec succès'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
