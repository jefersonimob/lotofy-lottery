"use client"

import { useState } from "react"
import type { ProcessedLotofacilResult } from "@/lib/services/caixa-api"
import type { NextContestInfo } from "@/lib/types"

export function useCaixaApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  type SyncLatestResultResponse = {
    success: boolean
    message: string
    data?: ProcessedLotofacilResult
  }

  const syncLatestResult = async (): Promise<SyncLatestResultResponse> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sync-latest-result', {
        method: 'POST'
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Falha na sincronização')
      }

      return data as SyncLatestResultResponse
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sincronizar'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateHistoricalResults = async (maxContest?: number): Promise<{
    success: boolean
    message: string
    inserted?: number
    errors?: string[]
  }> => {
    setLoading(true)
    setError(null)

    try {
      const url = maxContest 
        ? `/api/update-historical-results?maxContest=${maxContest}`
        : '/api/update-historical-results'
        
      const response = await fetch(url, {
        method: 'POST'
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Falha na atualização histórica')
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar resultados históricos'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getLatestResult = async (): Promise<ProcessedLotofacilResult> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sync-latest-result')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Falha ao buscar resultado')
      }

      return data.data as ProcessedLotofacilResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar resultado'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { 
    loading, 
    error, 
    syncLatestResult, 
    getLatestResult,
    updateHistoricalResults
  }
}