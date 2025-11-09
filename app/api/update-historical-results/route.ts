import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { CaixaApiService } from "@/lib/services/caixa-api"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()

    // Verificar se o usuário é admin
    const { searchParams } = new URL(request.url)
    const maxContest = searchParams.get('maxContest')
    
    // Atualizar todos os resultados históricos
    const updateResult = await CaixaApiService.updateAllHistoricalResults(
      supabase, 
      maxContest ? parseInt(maxContest) : undefined
    )

    if (!updateResult.success) {
      return NextResponse.json(
        {
          error: "Falha na atualização",
          message: updateResult.message,
          errors: updateResult.errors
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: updateResult.message,
      inserted: updateResult.inserted,
      errors: updateResult.errors
    })
  } catch (error) {
    console.error("Erro na atualização histórica:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    )
  }
}