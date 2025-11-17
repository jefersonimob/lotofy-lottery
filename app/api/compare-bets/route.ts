import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import { matches, whoMatches } from "@/lib/utils/lottery-math"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bets, limit, startContest, endContest } = body

    if (!Array.isArray(bets) || bets.length === 0) {
      return NextResponse.json({ error: "Bets array is required" }, { status: 400 })
    }

    // Validate bets format
    for (const bet of bets) {
      if (!Array.isArray(bet) || bet.length < 15 || bet.length > 18) {
        return NextResponse.json(
          { error: "Each bet must be an array of 15-18 numbers" },
          { status: 400 }
        )
      }
    }

    // Build query for historical results
    let where: any = {}

    // Apply filters
    if (startContest && endContest) {
      where.contestNumber = {
        gte: startContest,
        lte: endContest
      }
    }

    const takeLimit = limit && typeof limit === "number" ? limit : 100

    const results = await prisma.lotteryResult.findMany({
      where,
      select: {
        contestNumber: true,
        numbers: true
      },
      orderBy: { contestNumber: 'desc' },
      take: takeLimit
    })

    if (!results || results.length === 0) {
      return NextResponse.json({ error: "No lottery results found" }, { status: 404 })
    }

    // Convert DB format to expected format
    const resultsFormatted = results.map(r => ({
      contest_number: r.contestNumber,
      numbers: JSON.parse(r.numbers)
    }))

    // Process each bet
    const comparisons = bets.map((bet: number[]) => {
      // Get array of drawn numbers for matches function
      const raffles = resultsFormatted.map(r => r.numbers)

      // Get hit distribution
      const hitDistribution = matches(bet, raffles)

      // Get detailed matches (which contests had X hits)
      const rafflesRecord: Record<number, number[]> = {}
      resultsFormatted.forEach(r => {
        rafflesRecord[r.contest_number] = r.numbers
      })
      const detailedMatches = whoMatches(bet, rafflesRecord)

      // Calculate best result
      const hits = Object.keys(hitDistribution)
        .map(Number)
        .sort((a, b) => b - a)
      const bestHit = hits.length > 0 ? hits[0] : 0

      return {
        bet,
        bestHit,
        hitDistribution,
        detailedMatches,
        totalDrawsAnalyzed: results.length,
      }
    })

    return NextResponse.json({
      data: {
        comparisons,
        period: {
          startContest: resultsFormatted[resultsFormatted.length - 1]?.contest_number,
          endContest: resultsFormatted[0]?.contest_number,
          totalDraws: results.length,
        },
      },
    })
  } catch (error) {
    console.error("Error comparing bets:", error)
    return NextResponse.json({ error: "Failed to compare bets" }, { status: 500 })
  }
}
