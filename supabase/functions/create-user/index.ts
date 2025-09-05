// @ts-ignore - Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno runtime  
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Deno types
declare const Deno: any

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header to verify admin access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the requesting user is an admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const userData = await req.json()
    const { email, full_name, role, country_id, series_id, phone, date_of_birth, status } = userData

    // Validate required fields
    if (!email || !country_id) {
      return new Response(
        JSON.stringify({ error: 'Email and country are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate UUID format for country_id and series_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(country_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid country_id format. Must be a valid UUID.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (series_id && !uuidRegex.test(series_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid series_id format. Must be a valid UUID.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const emailExists = existingUsers?.users?.some((u: any) => u.email === email)

    if (emailExists) {
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate a secure temporary password
    const tempPassword = crypto.randomUUID().slice(0, 12) + 'Temp123!'

    // Prepare user metadata for the trigger
    // The trigger expects these fields in raw_user_meta_data
    const userMetadata = {
      full_name: full_name || '',
      country_id: country_id,
      series_id: role === 'user' ? series_id || null : null,
      role: role || 'user',
      phone: phone || null,
      date_of_birth: date_of_birth || null,
      status: status || 'active'
    }

    console.log('Creating user with metadata:', userMetadata)

    // Create auth user - the trigger will automatically create the profile
    const { data: authUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: userMetadata // This becomes raw_user_meta_data in the trigger
    })

    if (createUserError) {
      console.error('Auth creation error:', {
        message: createUserError.message,
        status: createUserError.status,
        code: createUserError.code,
        email: email
      })
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to create user: ${createUserError.message}`,
          details: createUserError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!authUser?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'User creation failed - no user ID returned' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Wait a moment for the trigger to complete, then fetch the created profile
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const { data: profileResult, error: profileFetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single()

    if (profileFetchError) {
      console.error('Profile fetch error after creation:', profileFetchError)
      return new Response(
        JSON.stringify({ 
          error: 'User created but profile fetch failed',
          user_id: authUser.user.id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send password reset email so user can set their own password
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${new URL(req.url).origin}/auth/reset-password`,
      })
      
      if (resetError) {
        console.error('Password reset email error:', resetError)
      }
    } catch (emailError) {
      console.error('Password reset email error:', emailError)
      // Don't fail the whole operation if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: profileResult,
        message: 'User created successfully. A password reset email has been sent.' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('User creation error:', error)
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})