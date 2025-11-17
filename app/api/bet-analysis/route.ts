import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import {
  betQuantity,
  betCost,
  probability,
  probabilityLevel,
  sum,
  mean,
  pairs,
  primes,
} from "@/lib/utils/lottery-math"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bet, pricePerBet } = body

    if (!Array.isArray(bet) || bet.length < 15 || bet.length > 18) {
      return NextResponse.json(
        { error: "Bet must be an array of 15-18 unique numbers between 1 and 25" },
        { status: 400 }
      )
    }

    // Validate numbers
    const uniqueNumbers = new Set(bet)
    if (uniqueNumbers.size !== bet.length) {
      return NextResponse.json({ error: "Bet contains duplicate numbers" }, { status: 400 })
    }

    for (const num of bet) {
      if (!Number.isInteger(num) || num < 1 || num > 25) {
        return NextResponse.json(
          { error: "All numbers must be integers between 1 and 25" },
          { status: 400 }
        )
      }
    }

    const sortedBet = [...bet].sort((a, b) => a - b)
    const numberOfBets = betQuantity(bet.length)
    const price = pricePerBet || 3.0
    const cost = betCost(bet.length, price)
    const winProbability = probability(numberOfBets)
    const probLevel = probabilityLevel(winProbability)

    // Calculate patterns
    const betSum = sum(sortedBet)
    const betMean = mean(sortedBet)
    const pairCount = pairs(sortedBet)
    const oddCount = bet.length - pairCount
    const primeCount = primes(sortedBet)

    // Check for sequences
    const sequences = findSequences(sortedBet)

    // Analyze distribution across ranges
    const ranges = {
      range1_5: sortedBet.filter((n) => n >= 1 && n <= 5).length,
      range6_10: sortedBet.filter((n) => n >= 6 && n <= 10).length,
      range11_15: sortedBet.filter((n) => n >= 11 && n <= 15).length,
      range16_20: sortedBet.filter((n) => n >= 16 && n <= 20).length,
      range21_25: sortedBet.filter((n) => n >= 21 && n <= 25).length,
    }

    // Get hot/cold status for each number
    const stats = await prisma.numberStatistic.findMany({
      where: {
        numberValue: { in: sortedBet }
      },
      select: {
        numberValue: true,
        hotColdStatus: true,
        frequency: true,
        daysSinceLastDraw: true
      }
    })

    const numberDetails = sortedBet.map((num) => {
      const stat = stats?.find(s => s.numberValue === num)
      return {
        number: num,
        status: stat?.hotColdStatus || "neutral",
        frequency: stat?.frequency || 0,
        daysSinceLastDraw: stat?.daysSinceLastDraw || 0,
      }
    })

    const hotNumbers = numberDetails.filter((n) => n.status === "hot").length
    const coldNumbers = numberDetails.filter((n) => n.status === "cold").length
    const neutralNumbers = numberDetails.filter((n) => n.status === "neutral").length

    const analysis = {
      bet: sortedBet,
      quantity: {
        totalNumbers: bet.length,
        numberOfCombinations: numberOfBets,
      },
      cost: {
        pricePerBet: price,
        totalCost: cost,
      },
      probability: {
        winChance: `1 em ${winProbability.toLocaleString("pt-BR")}`,
        probabilityLevel: probLevel,
        percentageChance: ((1 / winProbability) * 100).toFixed(8) + "%",
      },
      patterns: {
        sum: betSum,
        mean: betMean,
        pairs: pairCount,
        odds: oddCount,
        primes: primeCount,
        sequences: sequences.length,
        sequenceDetails: sequences,
      },
      distribution: {
        ranges,
        balance:
          Object.values(ranges).every((v) => v >= 2 && v <= 4) ? "balanced" : "unbalanced",
      },
      numberStatus: {
        hot: hotNumbers,
        cold: coldNumbers,
        neutral: neutralNumbers,
        details: numberDetails,
      },
    }

    return NextResponse.json({ data: analysis })
  } catch (error) {
    console.error("Error analyzing bet:", error)
    return NextResponse.json({ error: "Failed to analyze bet" }, { status: 500 })
  }
}

function findSequences(sortedBet: number[]): number[][] {
  const sequences: number[][] = []
  let currentSequence: number[] = [sortedBet[0]]

  for (let i = 1; i < sortedBet.length; i++) {
    if (sortedBet[i] === sortedBet[i - 1] + 1) {
      currentSequence.push(sortedBet[i])
    } else {
      if (currentSequence.length >= 3) {
        sequences.push([...currentSequence])
      }
      currentSequence = [sortedBet[i]]
    }
  }

  if (currentSequence.length >= 3) {
    sequences.push(currentSequence)
  }

  return sequences
}
