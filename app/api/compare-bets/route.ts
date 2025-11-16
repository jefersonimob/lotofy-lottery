import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { matches, whoMatches } from "@/lib/utils/lottery-math"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
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
    let query = supabase
      .from("lottery_results")
      .select("contest_number, numbers")
      .order("contest_number", { ascending: false })

    // Apply filters
    if (startContest && endContest) {
      query = query.gte("contest_number", startContest).lte("contest_number", endContest)
    } else if (limit && typeof limit === "number") {
      query = query.limit(limit)
    } else {
      // Default to last 100 draws
      query = query.limit(100)
    }

    const { data: results, error: resultsError } = await query

    if (resultsError) throw resultsError

    if (!results || results.length === 0) {
      return NextResponse.json({ error: "No lottery results found" }, { status: 404 })
    }

    // Process each bet
    const comparisons = bets.map((bet: number[]) => {
      // Get array of drawn numbers for matches function
      const raffles = results.map((r: { numbers: unknown }) => r.numbers as number[])

      // Get hit distribution
      const hitDistribution = matches(bet, raffles)

      // Get detailed matches (which contests had X hits)
      const rafflesRecord: Record<number, number[]> = {}
      results.forEach((r: { contest_number: number; numbers: unknown }) => {
        rafflesRecord[r.contest_number] = r.numbers as number[]
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
          startContest: results[results.length - 1]?.contest_number,
          endContest: results[0]?.contest_number,
          totalDraws: results.length,
        },
      },
    })
  } catch (error) {
    console.error("Error comparing bets:", error)
    return NextResponse.json({ error: "Failed to compare bets" }, { status: 500 })
  }
}
