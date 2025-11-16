"use client"

import { useLocalStorage } from "./use-local-storage"

export interface SavedBet {
  id: string
  numbers: number[]
  name?: string
  createdAt: string
  updatedAt: string
  notes?: string
}

const LOCAL_BETS_KEY = "lotofy_saved_bets"

export function useLocalBets() {
  const [bets, setBets, clearBets] = useLocalStorage<SavedBet[]>(LOCAL_BETS_KEY, [])

  const saveBet = (numbers: number[], name?: string, notes?: string) => {
    const newBet: SavedBet = {
      id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      numbers: [...numbers].sort((a, b) => a - b),
      name: name || `Aposta ${bets.length + 1}`,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setBets([...bets, newBet])
    return newBet
  }

  const updateBet = (id: string, updates: Partial<Omit<SavedBet, "id" | "createdAt">>) => {
    setBets(
      bets.map((bet) =>
        bet.id === id
          ? {
              ...bet,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : bet
      )
    )
  }

  const deleteBet = (id: string) => {
    setBets(bets.filter((bet) => bet.id !== id))
  }

  const getBet = (id: string) => {
    return bets.find((bet) => bet.id === id)
  }

  const duplicateBet = (id: string) => {
    const originalBet = getBet(id)
    if (!originalBet) return null

    return saveBet(
      originalBet.numbers,
      `${originalBet.name} (cópia)`,
      originalBet.notes
    )
  }

  const exportBets = () => {
    return JSON.stringify(bets, null, 2)
  }

  const importBets = (jsonString: string, replace = false) => {
    try {
      const importedBets = JSON.parse(jsonString) as SavedBet[]

      if (!Array.isArray(importedBets)) {
        throw new Error("Invalid format")
      }

      const validBets = importedBets.filter(
        (bet) =>
          bet.numbers &&
          Array.isArray(bet.numbers) &&
          bet.numbers.length >= 15 &&
          bet.numbers.length <= 18 &&
          bet.numbers.every((n) => typeof n === "number" && n >= 1 && n <= 25)
      )

      if (validBets.length === 0) {
        throw new Error("No valid bets found")
      }

      if (replace) {
        setBets(validBets)
      } else {
        const newBets = validBets.map((bet) => ({
          ...bet,
          id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
        setBets([...bets, ...newBets])
      }

      return validBets.length
    } catch (error) {
      console.error("Error importing bets:", error)
      return 0
    }
  }

  const downloadBets = () => {
    const json = exportBets()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `lotofy_apostas_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    bets,
    saveBet,
    updateBet,
    deleteBet,
    getBet,
    duplicateBet,
    clearBets,
    exportBets,
    importBets,
    downloadBets,
  }
}
