"use client"

import { useState } from "react"

interface ComparisonResult {
  bet: number[]
  bestHit: number
  hitDistribution: Record<number, number>
  detailedMatches: Record<number, number[]>
  totalDrawsAnalyzed: number
}

interface ComparisonData {
  comparisons: ComparisonResult[]
  period: {
    startContest?: number
    endContest?: number
    totalDraws: number
  }
}

interface UseBetComparisonOptions {
  limit?: number
  startContest?: number
  endContest?: number
}

export function useBetComparison() {
  const [data, setData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const compareBets = async (bets: number[][], options?: UseBetComparisonOptions) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/compare-bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bets,
          limit: options?.limit,
          startContest: options?.startContest,
          endContest: options?.endContest,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to compare bets")
      }

      setData(result.data)
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to compare bets"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, compareBets }
}

interface ExtendedStatisticsData {
  ones: Record<string, number>
  tens: Record<string, number>
  sums: Record<string, number>
  mean: Record<string, number>
  pairs: Record<string, number>
  primes: Record<string, number>
  quantity: Record<string, number>
  sequential: Record<string, number>[]
}

export function useExtendedStatistics() {
  const [data, setData] = useState<ExtendedStatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/extended-statistics")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch statistics")
      }

      setData(result.data)
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch statistics"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, fetchStatistics }
}

interface BetAnalysisData {
  bet: number[]
  quantity: {
    totalNumbers: number
    numberOfCombinations: number
  }
  cost: {
    pricePerBet: number
    totalCost: number
  }
  probability: {
    winChance: string
    probabilityLevel: number
    percentageChance: string
  }
  patterns: {
    sum: number
    mean: number
    pairs: number
    odds: number
    primes: number
    sequences: number
    sequenceDetails: number[][]
  }
  distribution: {
    ranges: Record<string, number>
    balance: string
  }
  numberStatus: {
    hot: number
    cold: number
    neutral: number
    details: Array<{
      number: number
      status: string
      frequency: number
      daysSinceLastDraw: number
    }>
  }
}

export function useBetAnalysis() {
  const [data, setData] = useState<BetAnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeBet = async (bet: number[], pricePerBet?: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/bet-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet, pricePerBet }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze bet")
      }

      setData(result.data)
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze bet"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, analyzeBet }
}
