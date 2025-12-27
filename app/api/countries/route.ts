import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/countries
 * Fetch countries from the database
 * Query params:
 *   - supported: boolean (optional) - Filter by supported countries only
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const supportedOnly = searchParams.get('supported') === 'true'

    let query = supabase
      .from('countries')
      .select('*')
      .order('display_order', { ascending: true })

    // Filter by supported countries if requested
    if (supportedOnly) {
      query = query.eq('is_supported', true)
    }

    const { data: countries, error } = await query

    if (error) {
      console.error('Countries fetch error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des pays' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      countries: countries || [],
      count: countries?.length || 0
    })

  } catch (error) {
    console.error('Countries fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
