import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await prisma.numberStatistic.findMany({
      orderBy: { numberValue: 'asc' }
    })

    // Convert to expected format (snake_case)
    const formattedData = data.map(stat => ({
      id: stat.id,
      number_value: stat.numberValue,
      frequency: stat.frequency,
      last_appearance_contest: stat.lastAppearanceContest,
      days_since_last_draw: stat.daysSinceLastDraw,
      hot_cold_status: stat.hotColdStatus,
      updated_at: stat.updatedAt.toISOString(),
    }))

    return NextResponse.json({ data: formattedData })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
