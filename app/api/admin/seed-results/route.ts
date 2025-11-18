import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { upsertLotteryResultsInBatches } from "@/lib/database/admin"
import { auth } from "@/auth"

export const runtime = "nodejs"

interface SeedResultRow {
  contest_number: number
  draw_date: string
  numbers: number[]
}

function findCsvFile(): string {
  const candidates: string[] = [
    path.join(process.cwd(), "resultado"),
    path.join(process.cwd(), "resultados"),
  ]
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir)
    const csv = files.find((f) => f.toLowerCase().endsWith(".csv"))
    if (csv) return path.join(dir, csv)
  }
  throw new Error("Nenhum arquivo CSV encontrado nas pastas 'resultado' ou 'resultados'")
}

function parseDateToISO(dateStr: string): string | null {
  const trimmed = dateStr.trim()
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  // DD/MM/YYYY
  const parts = trimmed.split(/[\/\-]/)
  if (parts.length >= 3) {
    if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
    }
    if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
      return trimmed
    }
  }
  return null
}

function parseCsv(filePath: string): { results: SeedResultRow[]; errors: string[] } {
  const text = fs.readFileSync(filePath, { encoding: "utf-8" })
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  const results: SeedResultRow[] = []
  const errors: string[] = []

  // Assume header present: concurso,data,bola1,...,bola15
  const startIndex = lines[0].toLowerCase().includes("concurso") ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const raw = lines[i]
    const cols = raw
      .split(",")
      .map((c) => c.trim().replace(/"/g, ""))

    if (cols.length < 17) {
      errors.push(`Linha ${i + 1}: dados insuficientes (esperado 17 colunas)`) 
      continue
    }

    const contest_number = Number.parseInt(cols[0], 10)
    const isoDate = parseDateToISO(cols[1])
    const nums = cols.slice(2, 17).map((n) => Number.parseInt(n, 10)).filter((n) => Number.isFinite(n))

    if (!Number.isFinite(contest_number)) {
      errors.push(`Linha ${i + 1}: concurso inválido`)
      continue
    }
    if (!isoDate) {
      errors.push(`Linha ${i + 1}: data inválida`) 
      continue
    }
    if (nums.length !== 15) {
      errors.push(`Linha ${i + 1}: deve conter exatamente 15 números`) 
      continue
    }
    if (nums.some((n) => n < 1 || n > 25)) {
      errors.push(`Linha ${i + 1}: números fora do intervalo 1..25`) 
      continue
    }

    nums.sort((a, b) => a - b)
    results.push({ contest_number, draw_date: isoDate, numbers: nums })
  }

  return { results, errors }
}

async function upsertInBatches(rows: SeedResultRow[], batchSize = 500): Promise<{ inserted: number; errors: string[] }> {
  // Using our new admin database functions instead of Supabase
  return await upsertLotteryResultsInBatches(rows.map(r => ({
    contest_number: r.contest_number,
    draw_date: r.draw_date,
    numbers: r.numbers
  })), batchSize);
}

export async function POST() {
  try {
    const session = await auth()
    
    // Check if user is authenticated and is admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = await getUserRole(session.user.id)
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    // Find and parse CSV
    const filePath = findCsvFile()
    const { results, errors: parseErrors } = parseCsv(filePath)

    if (results.length === 0) {
      return NextResponse.json({ error: `Nenhum dado válido no CSV. Erros: ${parseErrors.length}` }, { status: 400 })
    }

    const { inserted, errors: upsertErrors } = await upsertInBatches(results)

    return NextResponse.json({
      success: true,
      summary: {
        total_rows: results.length,
        inserted,
        parse_errors: parseErrors.length,
        upsert_errors: upsertErrors.length,
      },
      parse_errors: parseErrors,
      upsert_errors: upsertErrors,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function getUserRole(userId: string) {
  try {
    // Import here to avoid circular dependencies
    const { getUserRole } = await import("@/lib/database/server")
    return await getUserRole(userId)
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'user'
  }
}