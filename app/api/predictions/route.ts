import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await prisma.userPrediction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Convert to expected format
    const formattedData = data.map(pred => ({
      id: pred.id,
      user_id: pred.userId,
      contest_number: pred.contestNumber,
      predicted_numbers: JSON.parse(pred.predictedNumbers),
      prediction_method: pred.predictionMethod,
      confidence_score: pred.confidenceScore,
      prize_level: pred.prizeLevel,
      is_winner: pred.isWinner,
      checked_at: pred.checkedAt?.toISOString() || null,
      created_at: pred.createdAt.toISOString(),
    }))

    return NextResponse.json({ data: formattedData })
  } catch (error) {
    console.error("Error fetching predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { predicted_numbers, prediction_method, confidence_score, contest_number } = body

    // Validate input
    if (!predicted_numbers || predicted_numbers.length !== 15 || !prediction_method) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    const data = await prisma.userPrediction.create({
      data: {
        userId: session.user.id,
        predictedNumbers: JSON.stringify(predicted_numbers),
        predictionMethod: prediction_method,
        confidenceScore: confidence_score || null,
        contestNumber: contest_number || null,
      }
    })

    // Convert to expected format
    const result = {
      id: data.id,
      user_id: data.userId,
      contest_number: data.contestNumber,
      predicted_numbers: JSON.parse(data.predictedNumbers),
      prediction_method: data.predictionMethod,
      confidence_score: data.confidenceScore,
      prize_level: data.prizeLevel,
      is_winner: data.isWinner,
      checked_at: data.checkedAt?.toISOString() || null,
      created_at: data.createdAt.toISOString(),
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("Error creating prediction:", error)
    return NextResponse.json({ error: "Failed to create prediction" }, { status: 500 })
  }
}
