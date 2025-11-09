import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/all-games/similar
 *
 * Encontra jogos similares a um jogo fornecido
 *
 * Body:
 * {
 *   "numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
 *   "minMatches": 11  // mínimo de números em comum (padrão: 11)
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { numbers, minMatches = 11 } = body

    // Validações
    if (!Array.isArray(numbers) || numbers.length !== 15) {
      return NextResponse.json(
        { error: 'Deve fornecer exatamente 15 números' },
        { status: 400 }
      )
    }

    if (minMatches < 1 || minMatches > 15) {
      return NextResponse.json(
        { error: 'minMatches deve estar entre 1 e 15' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Usar a função PostgreSQL find_similar_games
    const { data, error } = await supabase
      .rpc('find_similar_games', {
        input_numbers: numbers,
        min_matches: minMatches
      })

    if (error) {
      console.error('Erro ao buscar jogos similares:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar jogos similares' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      input_numbers: numbers,
      min_matches: minMatches,
      total_found: data?.length || 0,
      similar_games: data || []
    })

  } catch (error) {
    console.error('Erro na API all-games/similar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
