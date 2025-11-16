import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sum, mean, pairs, primes } from "@/lib/utils/lottery-math"

type Numerical = { [key: string]: number }

interface ExtendedStatistics {
  ones: Numerical
  tens: Numerical
  sums: Numerical
  mean: Numerical
  pairs: Numerical
  primes: Numerical
  quantity: Numerical
  sequential: Numerical[]
}

export async function GET() {
  const supabase = await createClient()

  try {
    const { data: results, error } = await supabase
      .from("lottery_results")
      .select("numbers")
      .order("contest_number", { ascending: true })

    if (error) throw error

    if (!results || results.length === 0) {
      return NextResponse.json({ error: "No lottery results found" }, { status: 404 })
    }

    const data = results.map((r: { numbers: unknown }) => r.numbers as number[])

    // Calculate all statistics
    const statistics: ExtendedStatistics = {
      ones: calculateOnesDistribution(data),
      tens: calculateTensDistribution(data),
      sums: calculateSumsDistribution(data),
      mean: calculateMeanDistribution(data),
      pairs: calculatePairsDistribution(data),
      primes: calculatePrimesDistribution(data),
      quantity: calculateQuantityDistribution(data),
      sequential: calculateSequentialDistribution(data),
    }

    return NextResponse.json({ data: statistics })
  } catch (error) {
    console.error("Error fetching extended statistics:", error)
    return NextResponse.json({ error: "Failed to fetch extended statistics" }, { status: 500 })
  }
}

function calculateOnesDistribution(data: number[][]): Numerical {
  const ones = data.reduce((acc, raffle) => {
    return [...acc, ...raffle.map((num) => parseInt(num.toString().slice(-1)))]
  }, [] as number[])

  return countOccurrences(ones)
}

function calculateTensDistribution(data: number[][]): Numerical {
  const getTen = (n: number) => Math.ceil(n / 10) * 10
  const tens = data.reduce((acc, raffle) => {
    return [...acc, ...raffle.map((num) => getTen(num))]
  }, [] as number[])

  return countOccurrences(tens)
}

function calculateSumsDistribution(data: number[][]): Numerical {
  const sums = data.map((raffle) => sum(raffle))
  return countOccurrences(sums)
}

function calculateMeanDistribution(data: number[][]): Numerical {
  const means = data.map((raffle) => mean(raffle))
  return countOccurrences(means)
}

function calculatePairsDistribution(data: number[][]): Numerical {
  const pairCounts = data.map((raffle) => pairs(raffle))
  return countOccurrences(pairCounts)
}

function calculatePrimesDistribution(data: number[][]): Numerical {
  const primeCounts = data.map((raffle) => primes(raffle))
  return countOccurrences(primeCounts)
}

function calculateQuantityDistribution(data: number[][]): Numerical {
  const allNumbers = data.reduce((acc, raffle) => [...acc, ...raffle], [] as number[])
  return countOccurrences(allNumbers)
}

function calculateSequentialDistribution(data: number[][]): Numerical[] {
  const sequential: number[][] = []

  data.forEach((raffle) => {
    raffle.forEach((num, index) => {
      if (!sequential[index]) sequential[index] = []
      sequential[index].push(num)
    })
  })

  return sequential.map((nums) => countOccurrences(nums))
}

function countOccurrences(arr: number[]): Numerical {
  const map: { [k: number]: number } = {}

  arr.forEach((v) => {
    if (map[v]) {
      map[v]++
    } else {
      map[v] = 1
    }
  })

  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .reduce((r, [k, v]) => ({ ...r, [`#${k}`]: v }), {})
}
