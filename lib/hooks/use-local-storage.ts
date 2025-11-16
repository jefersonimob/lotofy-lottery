"use client"

import { useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  const removeValue = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)
      }
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  }

  return [storedValue, setValue, removeValue] as const
}

export function clearAllLocalStorage() {
  if (typeof window !== "undefined") {
    window.localStorage.clear()
  }
}

export function exportLocalStorageData(keys: string[]): string {
  const data: Record<string, unknown> = {}

  keys.forEach((key) => {
    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key)
      if (item) {
        try {
          data[key] = JSON.parse(item)
        } catch {
          data[key] = item
        }
      }
    }
  })

  return JSON.stringify(data, null, 2)
}

export function importLocalStorageData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)

    Object.entries(data).forEach(([key, value]) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    })

    return true
  } catch (error) {
    console.error("Error importing data:", error)
    return false
  }
}
