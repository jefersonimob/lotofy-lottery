import { NextResponse } from 'next/server'
import { validateGame } from '@/lib/database/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/all-games/validate
 *
 * Valida se um jogo é válido (existe nas 3.268.760 combinações possíveis)
 *
 * Body:
 * {
 *   "numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { numbers } = body

    // Validações básicas
    if (!Array.isArray(numbers)) {
      return NextResponse.json(
        { error: 'O campo "numbers" deve ser um array' },
        { status: 400 }
      )
    }

    if (numbers.length !== 15) {
      return NextResponse.json(
        {
          error: 'Um jogo da Lotofácil deve ter exatamente 15 números',
          valid: false
        },
        { status: 400 }
      )
    }

    // Verificar se todos são números entre 1 e 25
    const allValid = numbers.every(n => Number.isInteger(n) && n >= 1 && n <= 25)
    if (!allValid) {
      return NextResponse.json(
        {
          error: 'Todos os números devem estar entre 1 e 25',
          valid: false
        },
        { status: 400 }
      )
    }

    // Verificar duplicatas
    const uniqueNumbers = [...new Set(numbers)]
    if (uniqueNumbers.length !== 15) {
      return NextResponse.json(
        {
          error: 'Não pode haver números duplicados',
          valid: false
        },
        { status: 400 }
      )
    }

    // Validar jogo usando nossa nova função
    const validationResult = await validateGame(numbers)

    return NextResponse.json(validationResult)

  } catch (error) {
    console.error('Erro na API all-games/validate:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}