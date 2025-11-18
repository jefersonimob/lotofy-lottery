import prisma from '@/lib/prisma'
import { Profile, LotteryResult } from '@prisma/client'

/**
 * Funções utilitárias para acessar o banco de dados local MySQL
 */

export async function getUserById(id: string) {
  try {
    const user = await prisma.profile.findUnique({
      where: { id }
    })
    return user
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.profile.findUnique({
      where: { email }
    })
    return user
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export async function getUserRole(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    return profile?.role || 'user'
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'user'
  }
}

export async function getAllLotteryResults() {
  try {
    const results = await prisma.lotteryResult.findMany({
      orderBy: { contestNumber: 'asc' }
    })
    return results
  } catch (error) {
    console.error('Error getting all lottery results:', error)
    return []
  }
}

export async function getLotteryResultByContest(contestNumber: number) {
  try {
    const result = await prisma.lotteryResult.findUnique({
      where: { contestNumber }
    })
    return result
  } catch (error) {
    console.error(`Error getting lottery result for contest ${contestNumber}:`, error)
    return null
  }
}

export async function createLotteryResult(data: {
  contestNumber: number
  drawDate: Date
  numbers: number[]
}) {
  try {
    const result = await prisma.lotteryResult.create({
      data: {
        contestNumber: data.contestNumber,
        drawDate: data.drawDate,
        numbers: JSON.stringify(data.numbers)
      }
    })
    return result
  } catch (error) {
    console.error('Error creating lottery result:', error)
    throw error
  }
}

export async function upsertLotteryResult(data: {
  contestNumber: number
  drawDate: Date
  numbers: number[]
}) {
  try {
    const result = await prisma.lotteryResult.upsert({
      where: { contestNumber: data.contestNumber },
      update: {
        drawDate: data.drawDate,
        numbers: JSON.stringify(data.numbers)
      },
      create: {
        contestNumber: data.contestNumber,
        drawDate: data.drawDate,
        numbers: JSON.stringify(data.numbers)
      }
    })
    return result
  } catch (error) {
    console.error('Error upserting lottery result:', error)
    throw error
  }
}

export async function getAdminStats() {
  try {
    // Contagem total de resultados
    const totalResults = await prisma.lotteryResult.count()
    
    // Último concurso
    const latestResult = await prisma.lotteryResult.findFirst({
      orderBy: { contestNumber: 'desc' }
    })
    
    // Contagem de usuários
    const totalUsers = await prisma.profile.count()
    
    // Contagem de usuários administradores
    const adminUsers = await prisma.profile.count({
      where: { role: 'admin' }
    })
    
    return {
      total_results: totalResults,
      latest_contest: latestResult?.contestNumber || 0,
      latest_draw_date: latestResult?.drawDate || null,
      total_users: totalUsers,
      admin_users: adminUsers
    }
  } catch (error) {
    console.error('Error getting admin stats:', error)
    throw error
  }
}

export async function findSimilarGames(inputNumbers: number[], minMatches: number) {
  try {
    // Esta função simula a funcionalidade da função PostgreSQL find_similar_games
    // Para uma implementação otimizada, seria melhor ter isso diretamente no banco
    
    // Obter todos os resultados
    const allResults = await prisma.lotteryResult.findMany()
    
    // Filtrar jogos com pelo menos minMatches números em comum
    const similarGames = allResults.filter(result => {
      try {
        const numbers = JSON.parse(result.numbers) as number[]
        const matches = inputNumbers.filter(num => numbers.includes(num))
        return matches.length >= minMatches
      } catch (parseError) {
        console.error('Error parsing numbers for result:', result.id, parseError)
        return false
      }
    }).map(result => {
      try {
        const numbers = JSON.parse(result.numbers) as number[]
        const matches = inputNumbers.filter(num => numbers.includes(num))
        const misses = numbers.filter(num => !inputNumbers.includes(num))
        
        return {
          contest_number: result.contestNumber,
          draw_date: result.drawDate.toISOString().split('T')[0],
          numbers: numbers,
          matches: matches,
          match_count: matches.length,
          misses: misses
        }
      } catch (parseError) {
        console.error('Error parsing numbers for result:', result.id, parseError)
        return null
      }
    }).filter(Boolean)
    
    return similarGames
  } catch (error) {
    console.error('Error finding similar games:', error)
    throw error
  }
}

export async function getAllGamesStats() {
  try {
    // Count total games
    const count = await prisma.allPossibleGame.count()
    
    // Get some basic statistics (this is a simplified version)
    // In a production environment, you might want to pre-calculate these
    const games = await prisma.allPossibleGame.findMany({
      take: 1000, // Limit for performance
      select: {
        sumNumbers: true,
        oddCount: true,
        hasSequence: true
      }
    })
    
    // Calculate basic stats from sample
    let minSum = Infinity
    let maxSum = -Infinity
    let sumTotal = 0
    let gamesWithSequences = 0
    let balanced78 = 0
    let balanced87 = 0
    
    for (const game of games) {
      minSum = Math.min(minSum, game.sumNumbers)
      maxSum = Math.max(maxSum, game.sumNumbers)
      sumTotal += game.sumNumbers
      
      if (game.hasSequence) {
        gamesWithSequences++
      }
      
      // Simplified balance calculation
      if (game.oddCount === 7) {
        balanced78++
      } else if (game.oddCount === 8) {
        balanced87++
      }
    }
    
    const avgSum = games.length > 0 ? sumTotal / games.length : 0
    
    return {
      total_games: count,
      expected_total: 3268760,
      is_complete: count === 3268760,
      stats: {
        total_games: count,
        min_sum: minSum === Infinity ? null : minSum,
        max_sum: maxSum === -Infinity ? null : maxSum,
        avg_sum: avgSum || null,
        games_with_sequences: gamesWithSequences,
        balanced_7_8: balanced78,
        balanced_8_7: balanced87
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting all games stats:', error)
    throw error
  }
}

export async function validateGame(numbers: number[]) {
  try {
    // Validate input
    if (!Array.isArray(numbers)) {
      throw new Error('Numbers must be an array')
    }

    if (numbers.length !== 15) {
      throw new Error('A Lotofácil game must have exactly 15 numbers')
    }

    // Check if all are integers between 1 and 25
    const allValid = numbers.every(n => Number.isInteger(n) && n >= 1 && n <= 25)
    if (!allValid) {
      throw new Error('All numbers must be between 1 and 25')
    }

    // Check for duplicates
    const uniqueNumbers = [...new Set(numbers)]
    if (uniqueNumbers.length !== 15) {
      throw new Error('Cannot have duplicate numbers')
    }

    // Sort numbers
    const sortedNumbers = [...numbers].sort((a, b) => a - b)
    const numbersStr = sortedNumbers.map(n => String(n).padStart(2, '0')).join('-')

    // Search in database
    const game = await prisma.allPossibleGame.findUnique({
      where: { numbersStr },
      select: {
        id: true,
        numbers: true,
        numbersStr: true
      }
    })

    const isValid = !!game

    return {
      valid: isValid,
      numbers: sortedNumbers,
      numbers_str: numbersStr,
      game_id: game?.id || null,
      message: isValid
        ? 'Jogo válido! Esta combinação existe nas possibilidades da Lotofácil.'
        : 'Jogo inválido! Esta combinação não existe nas possibilidades da Lotofácil.'
    }
  } catch (error) {
    console.error('Error validating game:', error)
    throw error
  }
}

export async function getLotteryResultByContest(contestNumber: number) {
  try {
    const result = await prisma.lotteryResult.findUnique({
      where: { contestNumber }
    })
    return result
  } catch (error) {
    console.error(`Error getting lottery result for contest ${contestNumber}:`, error)
    return null
  }
}