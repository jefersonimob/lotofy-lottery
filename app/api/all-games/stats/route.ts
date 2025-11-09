import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/all-games/stats
 *
 * Retorna estatísticas gerais sobre todos os jogos possíveis
 */
export async function GET() {
  try {
    const supabase = await createServerClient()

    // Buscar view de estatísticas
    const { data: stats, error: statsError } = await supabase
      .from('all_games_stats')
      .select('*')
      .single()

    if (statsError) {
      console.error('Erro ao buscar estatísticas:', statsError)
    }

    // Buscar count total (fallback se view não existir)
    const { count, error: countError } = await supabase
      .from('all_possible_games')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Erro ao contar jogos:', countError)
      return NextResponse.json(
        { error: 'Erro ao buscar estatísticas' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      total_games: count || 0,
      expected_total: 3268760,
      is_complete: count === 3268760,
      stats: stats || {
        total_games: count,
        min_sum: null,
        max_sum: null,
        avg_sum: null,
        games_with_sequences: null,
        balanced_7_8: null,
        balanced_8_7: null
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro na API all-games/stats:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
