import prisma from '@/lib/prisma'

/**
 * Funções administrativas para acesso ao banco de dados
 */

export async function upsertLotteryResultsInBatches(rows: Array<{ 
  contest_number: number; 
  draw_date: string; 
  numbers: number[] 
}>, batchSize = 500) {
  try {
    const errors: string[] = []
    let inserted = 0

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      
      // Upsert each item in the batch
      for (const row of batch) {
        try {
          await prisma.lotteryResult.upsert({
            where: { contestNumber: row.contest_number },
            update: {
              drawDate: new Date(row.draw_date),
              numbers: JSON.stringify(row.numbers)
            },
            create: {
              contestNumber: row.contest_number,
              drawDate: new Date(row.draw_date),
              numbers: JSON.stringify(row.numbers)
            }
          })
          inserted++
        } catch (error) {
          errors.push(`Row ${i}: ${(error as Error).message || String(error)}`)
        }
      }
    }

    return { inserted, errors }
  } catch (error) {
    console.error('Error in upsertLotteryResultsInBatches:', error)
    throw error
  }
}