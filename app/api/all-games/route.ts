import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/all-games
 *
 * Consulta jogos possíveis com filtros
 *
 * Query params:
 * - oddCount: número de ímpares (ex: 7,8)
 * - evenCount: número de pares
 * - sumMin: soma mínima
 * - sumMax: soma máxima
 * - mustInclude: números que devem estar presentes (ex: 3,7,15)
 * - mustExclude: números que não podem estar (ex: 25)
 * - hasSequence: true/false
 * - limit: limite de resultados (padrão: 100, máx: 1000)
 * - offset: paginação
 */
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)

    // Parsear parâmetros
    const oddCount = searchParams.get('oddCount')?.split(',').map(Number)
    const evenCount = searchParams.get('evenCount')?.split(',').map(Number)
    const sumMin = searchParams.get('sumMin') ? Number(searchParams.get('sumMin')) : null
    const sumMax = searchParams.get('sumMax') ? Number(searchParams.get('sumMax')) : null
    const mustInclude = searchParams.get('mustInclude')?.split(',').map(Number)
    const mustExclude = searchParams.get('mustExclude')?.split(',').map(Number)
    const hasSequence = searchParams.get('hasSequence')
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 1000)
    const offset = Number(searchParams.get('offset')) || 0

    // Query base
    let query = supabase
      .from('all_possible_games')
      .select('id, numbers, numbers_str, sum_numbers, odd_count, even_count, has_sequence', {
        count: 'exact'
      })

    // Aplicar filtros
    if (oddCount && oddCount.length > 0) {
      query = query.in('odd_count', oddCount)
    }

    if (evenCount && evenCount.length > 0) {
      query = query.in('even_count', evenCount)
    }

    if (sumMin !== null) {
      query = query.gte('sum_numbers', sumMin)
    }

    if (sumMax !== null) {
      query = query.lte('sum_numbers', sumMax)
    }

    if (hasSequence !== null) {
      query = query.eq('has_sequence', hasSequence === 'true')
    }

    // Filtros de números (requer post-processing)
    // TODO: Implementar usando contains com array operators do PostgreSQL

    // Paginação
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar jogos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar jogos possíveis' },
        { status: 500 }
      )
    }

    // Post-processing para filtros de números
    let filteredData = data || []

    if (mustInclude && mustInclude.length > 0) {
      filteredData = filteredData.filter(game =>
        mustInclude.every(num => game.numbers.includes(num))
      )
    }

    if (mustExclude && mustExclude.length > 0) {
      filteredData = filteredData.filter(game =>
        !mustExclude.some(num => game.numbers.includes(num))
      )
    }

    return NextResponse.json({
      games: filteredData,
      total: count,
      filtered: filteredData.length,
      offset,
      limit
    })

  } catch (error) {
    console.error('Erro na API all-games:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
