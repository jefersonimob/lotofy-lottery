#!/usr/bin/env node

/**
 * Script para importar todos os 3.268.760 jogos possíveis da Lotofácil
 *
 * Uso:
 *   npm run import-all-games
 *
 * Fonte dos dados: TODO/games_csv.zip
 * Tempo estimado: 5-10 minutos
 */

import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { createClient } from '@supabase/supabase-js'
import unzipper from 'unzipper'
import path from 'path'

// Configuração
const BATCH_SIZE = 1000
const ZIP_PATH = path.join(process.cwd(), 'TODO', 'games_csv.zip')

// Supabase client com service role key (necessário para operações admin)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas')
  console.error('   NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Calcula metadados de um jogo
 */
function calculateGameMetadata(numbers: number[]) {
  const sum = numbers.reduce((a, b) => a + b, 0)
  const odd = numbers.filter(n => n % 2 === 1).length
  const even = numbers.filter(n => n % 2 === 0).length
  const low = numbers.filter(n => n <= 12).length
  const high = numbers.filter(n => n >= 13).length

  // Distribuição por faixas
  const range_01_05 = numbers.filter(n => n >= 1 && n <= 5).length
  const range_06_10 = numbers.filter(n => n >= 6 && n <= 10).length
  const range_11_15 = numbers.filter(n => n >= 11 && n <= 15).length
  const range_16_20 = numbers.filter(n => n >= 16 && n <= 20).length
  const range_21_25 = numbers.filter(n => n >= 21 && n <= 25).length

  // Detectar sequências
  let maxSequence = 1
  let currentSequence = 1
  let hasSequence = false

  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === numbers[i - 1] + 1) {
      currentSequence++
      maxSequence = Math.max(maxSequence, currentSequence)
      if (currentSequence >= 3) hasSequence = true
    } else {
      currentSequence = 1
    }
  }

  return {
    sum,
    odd,
    even,
    low,
    high,
    range_01_05,
    range_06_10,
    range_11_15,
    range_16_20,
    range_21_25,
    hasSequence,
    maxSequence
  }
}

/**
 * Processa uma linha do CSV
 */
function parseGameLine(line: string): any {
  // Remove aspas e split por hífen
  const cleanLine = line.replace(/"/g, '').trim()
  if (!cleanLine) return null

  const numbers = cleanLine.split('-').map(n => parseInt(n, 10))

  // Validação básica
  if (numbers.length !== 15) return null
  if (numbers.some(n => isNaN(n) || n < 1 || n > 25)) return null

  const metadata = calculateGameMetadata(numbers)

  return {
    numbers,
    numbers_str: cleanLine,
    sum_numbers: metadata.sum,
    odd_count: metadata.odd,
    even_count: metadata.even,
    low_count: metadata.low,
    high_count: metadata.high,
    range_01_05: metadata.range_01_05,
    range_06_10: metadata.range_06_10,
    range_11_15: metadata.range_11_15,
    range_16_20: metadata.range_16_20,
    range_21_25: metadata.range_21_25,
    has_sequence: metadata.hasSequence,
    max_sequence_length: metadata.maxSequence
  }
}

/**
 * Insere batch no banco
 */
async function insertBatch(batch: any[], batchNumber: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('all_possible_games')
      .insert(batch)

    if (error) {
      console.error(`❌ Erro no batch ${batchNumber}:`, error.message)
      return false
    }

    return true
  } catch (err) {
    console.error(`❌ Exceção no batch ${batchNumber}:`, err)
    return false
  }
}

/**
 * Importa todos os jogos do CSV
 */
async function importAllGames() {
  console.log('🎲 Importador de Jogos Possíveis da Lotofácil\n')
  console.log(`📁 Arquivo: ${ZIP_PATH}`)
  console.log(`📦 Batch size: ${BATCH_SIZE} jogos\n`)

  let batch: any[] = []
  let totalProcessed = 0
  let totalInserted = 0
  let batchNumber = 0
  let errors = 0

  const startTime = Date.now()

  try {
    // Verifica se a tabela existe
    const { error: tableError } = await supabase
      .from('all_possible_games')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Erro: Tabela all_possible_games não existe!')
      console.error('   Execute primeiro: scripts/009_create_all_possible_games.sql')
      process.exit(1)
    }

    // Limpar tabela antes de importar (opcional)
    console.log('🗑️  Limpando dados existentes...')
    await supabase.from('all_possible_games').delete().neq('id', 0)
    console.log('✅ Tabela limpa\n')

    console.log('📖 Lendo arquivo ZIP...\n')

    // Processar o arquivo ZIP
    const zip = createReadStream(ZIP_PATH).pipe(unzipper.Parse())

    for await (const entry of zip) {
      if (entry.path !== 'games.csv') {
        entry.autodrain()
        continue
      }

      // Ler linha por linha
      const rl = createInterface({
        input: entry,
        crlfDelay: Infinity
      })

      for await (const line of rl) {
        const game = parseGameLine(line)
        if (!game) continue

        batch.push(game)
        totalProcessed++

        // Inserir batch quando atingir o tamanho
        if (batch.length >= BATCH_SIZE) {
          batchNumber++
          const success = await insertBatch(batch, batchNumber)

          if (success) {
            totalInserted += batch.length
            process.stdout.write(
              `\r✅ Processados: ${totalProcessed.toLocaleString()} | ` +
              `Inseridos: ${totalInserted.toLocaleString()} | ` +
              `Batch: ${batchNumber} | ` +
              `Progresso: ${((totalProcessed / 3268760) * 100).toFixed(2)}%`
            )
          } else {
            errors++
          }

          batch = []
        }
      }
    }

    // Inserir últimos registros
    if (batch.length > 0) {
      batchNumber++
      const success = await insertBatch(batch, batchNumber)
      if (success) {
        totalInserted += batch.length
      } else {
        errors++
      }
    }

    const endTime = Date.now()
    const durationSeconds = ((endTime - startTime) / 1000).toFixed(2)

    console.log('\n\n✅ Importação concluída!\n')
    console.log(`📊 Estatísticas:`)
    console.log(`   Total processado: ${totalProcessed.toLocaleString()} jogos`)
    console.log(`   Total inserido: ${totalInserted.toLocaleString()} jogos`)
    console.log(`   Batches: ${batchNumber}`)
    console.log(`   Erros: ${errors}`)
    console.log(`   Tempo: ${durationSeconds}s`)
    console.log(`   Velocidade: ${Math.round(totalProcessed / parseFloat(durationSeconds))} jogos/segundo\n`)

    // Verificar resultado final
    const { count } = await supabase
      .from('all_possible_games')
      .select('*', { count: 'exact', head: true })

    console.log(`🎯 Jogos no banco: ${count?.toLocaleString() || 0}`)

    if (count === 3268760) {
      console.log('✅ Sucesso total! Todos os 3.268.760 jogos importados!\n')
    } else {
      console.log(`⚠️  Atenção: Esperado 3.268.760, encontrado ${count}\n`)
    }

  } catch (error) {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  }
}

// Executar
importAllGames()
  .then(() => {
    console.log('🎉 Processo finalizado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })
