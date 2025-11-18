import { NextResponse } from 'next/server'
import { getAllGamesStats } from '@/lib/database/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/all-games/stats
 *
 * Retorna estatísticas gerais sobre todos os jogos possíveis
 */
export async function GET() {
  try {
    // Buscar estatísticas usando nossa nova função
    const statsData = await getAllGamesStats()

    return NextResponse.json(statsData)

  } catch (error) {
    console.error('Erro na API all-games/stats:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
