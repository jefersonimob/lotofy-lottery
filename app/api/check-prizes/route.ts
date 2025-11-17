import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { PrizeCheckerService } from "@/lib/services/prize-checker"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const contestNumber = url.searchParams.get('contest')

    let result

    if (contestNumber) {
      // Verificar prêmios para um concurso específico
      const contestNum = parseInt(contestNumber)
      if (isNaN(contestNum)) {
        return NextResponse.json(
          { error: "Número do concurso inválido" },
          { status: 400 }
        )
      }

      result = await PrizeCheckerService.checkUserPredictionsForContest(
        session.user.id,
        contestNum
      )
    } else {
      // Verificar todas as previsões do usuário
      result = await PrizeCheckerService.checkAllUserPredictions(
        session.user.id
      )
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error("Erro ao verificar prêmios:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { contestNumber, predictionIds } = body

    if (!contestNumber) {
      return NextResponse.json(
        { error: "Número do concurso é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar previsões específicas se IDs foram fornecidos
    let predictions
    if (predictionIds && predictionIds.length > 0) {
      predictions = await prisma.userPrediction.findMany({
        where: {
          userId: session.user.id,
          contestNumber: contestNumber,
          id: { in: predictionIds }
        }
      })
    } else {
      predictions = await prisma.userPrediction.findMany({
        where: {
          userId: session.user.id,
          contestNumber: contestNumber
        }
      })
    }

    if (predictions.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Nenhuma previsão encontrada para este concurso"
      })
    }

    // Buscar resultado do concurso
    const result = await prisma.lotteryResult.findUnique({
      where: { contestNumber: contestNumber },
      select: { numbers: true }
    })

    if (!result) {
      return NextResponse.json(
        { error: `Resultado do concurso ${contestNumber} não encontrado` },
        { status: 404 }
      )
    }

    const drawnNumbers = JSON.parse(result.numbers)
    const prizeResults = []

    // Verificar cada previsão
    for (const prediction of predictions) {
      const predictedNumbers = JSON.parse(prediction.predictedNumbers)
      const { matches, misses, matchCount } = PrizeCheckerService.checkMatches(
        predictedNumbers,
        drawnNumbers
      )

      const { level, description, isWinner } = PrizeCheckerService.getPrizeLevel(matchCount)

      prizeResults.push({
        prediction_id: prediction.id,
        contest_number: contestNumber,
        predicted_numbers: predictedNumbers,
        drawn_numbers: drawnNumbers,
        matches,
        misses,
        match_count: matchCount,
        prize_level: level,
        prize_description: description,
        is_winner: isWinner,
        created_at: prediction.createdAt.toISOString(),
        prediction_method: prediction.predictionMethod,
        confidence_score: prediction.confidenceScore
      })
    }

    // Calcular estatísticas
    const stats = PrizeCheckerService.calculatePerformanceStats(prizeResults)

    return NextResponse.json({
      success: true,
      data: {
        results: prizeResults,
        statistics: stats,
        contest_info: {
          contest_number: contestNumber,
          drawn_numbers: drawnNumbers,
          total_predictions_checked: predictions.length
        }
      }
    })
  } catch (error) {
    console.error("Erro ao verificar prêmios:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}
