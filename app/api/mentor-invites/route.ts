import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MentorRelationship } from '@/types/database'

// GET - List mentor invites for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Get current user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    // Get invites where user is the student
    const { data: sentInvites, error: sentError } = await supabase
      .from('mentor_invites')
      .select(`
        *,
        mentor_profile:profiles!mentor_profile_id(id, full_name, email, avatar_url)
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    if (sentError) throw sentError

    // Get invites where user is the mentor (by email)
    const { data: receivedInvites, error: receivedError } = await supabase
      .from('mentor_invites')
      .select(`
        *,
        student:profiles!student_id(id, full_name, email, avatar_url)
      `)
      .eq('mentor_email', profile.email)
      .order('created_at', { ascending: false })

    if (receivedError) throw receivedError

    return NextResponse.json({
      sent: sentInvites || [],
      received: receivedInvites || [],
    })
  } catch (error) {
    console.error('Mentor invites fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Create a new mentor invite
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      mentor_email,
      mentor_name,
      relationship = 'mentor',
      can_view_progress = true,
      can_view_courses = true,
      can_receive_reports = false,
    } = body

    // Validate required fields
    if (!mentor_email) {
      return NextResponse.json(
        { error: 'L\'email du mentor est requis' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(mentor_email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Validate relationship type
    const validRelationships: MentorRelationship[] = ['parent', 'tutor', 'teacher', 'mentor', 'other']
    if (!validRelationships.includes(relationship)) {
      return NextResponse.json(
        { error: 'Type de relation invalide' },
        { status: 400 }
      )
    }

    // Check user is a student
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'user') {
      return NextResponse.json(
        { error: 'Seuls les étudiants peuvent inviter des mentors' },
        { status: 403 }
      )
    }

    // Can't invite yourself
    if (profile.email.toLowerCase() === mentor_email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous inviter vous-même' },
        { status: 400 }
      )
    }

    // Check for existing active invite
    const { data: existingInvite } = await supabase
      .from('mentor_invites')
      .select('id, status')
      .eq('student_id', user.id)
      .eq('mentor_email', mentor_email.toLowerCase())
      .single()

    if (existingInvite) {
      if (existingInvite.status === 'pending') {
        return NextResponse.json(
          { error: 'Une invitation est déjà en attente pour cet email' },
          { status: 409 }
        )
      }
      if (existingInvite.status === 'accepted') {
        return NextResponse.json(
          { error: 'Cette personne est déjà votre mentor' },
          { status: 409 }
        )
      }
      // If declined or expired, we can update the existing invite
      const { data: updatedInvite, error: updateError } = await supabase
        .from('mentor_invites')
        .update({
          mentor_name,
          relationship,
          status: 'pending',
          can_view_progress,
          can_view_courses,
          can_receive_reports,
          invited_at: new Date().toISOString(),
          responded_at: null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', existingInvite.id)
        .select()
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        invite: updatedInvite,
        message: 'Invitation renvoyée avec succès',
      })
    }

    // Check if mentor email is already registered
    const { data: mentorProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', mentor_email.toLowerCase())
      .single()

    // Create the invite
    const { data: invite, error: insertError } = await supabase
      .from('mentor_invites')
      .insert({
        student_id: user.id,
        mentor_email: mentor_email.toLowerCase(),
        mentor_name,
        relationship,
        can_view_progress,
        can_view_courses,
        can_receive_reports,
        mentor_profile_id: mentorProfile?.id || null,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    // TODO: Send email notification to the mentor

    return NextResponse.json({
      success: true,
      invite,
      message: 'Invitation envoyée avec succès',
    }, { status: 201 })
  } catch (error) {
    console.error('Mentor invite create error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'invitation' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel/remove an invite
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const inviteId = searchParams.get('id')

    if (!inviteId) {
      return NextResponse.json(
        { error: 'ID de l\'invitation requis' },
        { status: 400 }
      )
    }

    // Check if user owns this invite
    const { data: invite } = await supabase
      .from('mentor_invites')
      .select('student_id')
      .eq('id', inviteId)
      .single()

    if (!invite || invite.student_id !== user.id) {
      return NextResponse.json(
        { error: 'Invitation non trouvée ou accès refusé' },
        { status: 404 }
      )
    }

    const { error: deleteError } = await supabase
      .from('mentor_invites')
      .delete()
      .eq('id', inviteId)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: 'Invitation supprimée',
    })
  } catch (error) {
    console.error('Mentor invite delete error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

// PATCH - Respond to an invite (accept/decline)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { invite_id, action } = body

    if (!invite_id || !action) {
      return NextResponse.json(
        { error: 'ID d\'invitation et action requis' },
        { status: 400 }
      )
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide (accept ou decline)' },
        { status: 400 }
      )
    }

    // Get user's email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    // Check if invite exists and is for this user
    const { data: invite } = await supabase
      .from('mentor_invites')
      .select('*')
      .eq('id', invite_id)
      .eq('mentor_email', profile.email)
      .single()

    if (!invite) {
      return NextResponse.json(
        { error: 'Invitation non trouvée' },
        { status: 404 }
      )
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cette invitation a déjà été traitée' },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('mentor_invites')
        .update({ status: 'expired' })
        .eq('id', invite_id)

      return NextResponse.json(
        { error: 'Cette invitation a expiré' },
        { status: 400 }
      )
    }

    // Update the invite
    const { data: updatedInvite, error: updateError } = await supabase
      .from('mentor_invites')
      .update({
        status: action === 'accept' ? 'accepted' : 'declined',
        responded_at: new Date().toISOString(),
        mentor_profile_id: profile.id,
      })
      .eq('id', invite_id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      invite: updatedInvite,
      message: action === 'accept'
        ? 'Invitation acceptée ! Vous pouvez maintenant suivre les progrès de cet étudiant.'
        : 'Invitation refusée.',
    })
  } catch (error) {
    console.error('Mentor invite response error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement de l\'invitation' },
      { status: 500 }
    )
  }
}
