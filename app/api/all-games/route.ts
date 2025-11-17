import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

    // Build where clause
    const where: any = {}

    if (oddCount && oddCount.length > 0) {
      where.oddCount = { in: oddCount }
    }

    if (evenCount && evenCount.length > 0) {
      where.evenCount = { in: evenCount }
    }

    if (sumMin !== null) {
      where.sumNumbers = { ...where.sumNumbers, gte: sumMin }
    }

    if (sumMax !== null) {
      where.sumNumbers = { ...where.sumNumbers, lte: sumMax }
    }

    if (hasSequence !== null) {
      where.hasSequence = hasSequence === 'true'
    }

    // Get total count and data
    const [count, data] = await Promise.all([
      prisma.allPossibleGame.count({ where }),
      prisma.allPossibleGame.findMany({
        where,
        select: {
          id: true,
          numbers: true,
          numbersStr: true,
          sumNumbers: true,
          oddCount: true,
          evenCount: true,
          hasSequence: true,
        },
        skip: offset,
        take: limit,
      })
    ])

    // Post-processing para filtros de números (MySQL doesn't support array operations)
    let filteredData = data.map(game => ({
      ...game,
      numbers: JSON.parse(game.numbers)
    }))

    if (mustInclude && mustInclude.length > 0) {
      filteredData = filteredData.filter((game) =>
        mustInclude.every(num => game.numbers.includes(num))
      )
    }

    if (mustExclude && mustExclude.length > 0) {
      filteredData = filteredData.filter((game) =>
        !mustExclude.some(num => game.numbers.includes(num))
      )
    }

    // Convert to expected format
    const formattedData = filteredData.map(game => ({
      id: game.id.toString(),
      numbers: game.numbers,
      numbers_str: game.numbersStr,
      sum_numbers: game.sumNumbers,
      odd_count: game.oddCount,
      even_count: game.evenCount,
      has_sequence: game.hasSequence,
    }))

    return NextResponse.json({
      games: formattedData,
      total: count,
      filtered: formattedData.length,
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
