"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getStockData, POPULAR_STOCKS, type CandleData, type StockInfo } from "../components/lib/api/upstox-client"

interface UseStockDataOptions {
  refreshInterval?: number // in milliseconds
  enableAutoRefresh?: boolean
}

interface UseStockDataReturn {
  data: CandleData[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refreshData: () => Promise<void>
  currentStock: StockInfo
  currentInterval: string
  setStock: (stock: StockInfo) => void
  setInterval: (interval: string) => void
}

export function useStockData(
  initialStock: StockInfo = POPULAR_STOCKS[0],
  initialInterval: string = "1D",
  options: UseStockDataOptions = {}
): UseStockDataReturn {
  const { refreshInterval = 30000, enableAutoRefresh = true } = options
  
  const [data, setData] = useState<CandleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [currentStock, setCurrentStock] = useState<StockInfo>(initialStock)
  const [currentInterval, setCurrentInterval] = useState<string>(initialInterval)
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  const fetchData = useCallback(async (stock: StockInfo, interval: string, signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError(null)
      
      const stockData = await getStockData(stock.instrumentKey, interval)
      
      if (signal?.aborted) return
      
      setData(stockData)
      setLastUpdated(new Date())
    } catch (err) {
      if (signal?.aborted) return
      
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch stock data"
      setError(errorMessage)
      console.error("Error fetching stock data:", err)
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  const refreshData = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    await fetchData(currentStock, currentInterval, abortControllerRef.current.signal)
  }, [currentStock, currentInterval, fetchData])

  const setStock = useCallback((stock: StockInfo) => {
    setCurrentStock(stock)
  }, [])

  const setInterval = useCallback((interval: string) => {
    setCurrentInterval(interval)
  }, [])

  // Effect for initial load and when stock/interval changes
  useEffect(() => {
    refreshData()
  }, [currentStock, currentInterval])

  // Effect for auto-refresh
  useEffect(() => {
    if (!enableAutoRefresh) return

    const setupAutoRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      refreshTimeoutRef.current = setTimeout(() => {
        refreshData()
        setupAutoRefresh() // Schedule next refresh
      }, refreshInterval)
    }

    // Only auto-refresh for intraday intervals
    const isIntradayInterval = ["1m", "5m", "15m", "30m", "1h"].includes(currentInterval)
    if (isIntradayInterval && !loading) {
      setupAutoRefresh()
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [currentInterval, refreshInterval, enableAutoRefresh, loading, refreshData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    currentStock,
    currentInterval,
    setStock,
    setInterval
  }
}

// Custom hook for getting current stock price and stats
export function useStockStats(data: CandleData[]) {
  return {
    currentPrice: data.length > 0 ? data[data.length - 1].close : 0,
    openPrice: data.length > 0 ? data[data.length - 1].open : 0,
    highPrice: data.length > 0 ? Math.max(...data.map(d => d.high)) : 0,
    lowPrice: data.length > 0 ? Math.min(...data.map(d => d.low)) : 0,
    volume: data.length > 0 ? data[data.length - 1].volume : 0,
    change: data.length > 1 ? data[data.length - 1].close - data[data.length - 2].close : 0,
    changePercent: data.length > 1 ? 
      ((data[data.length - 1].close - data[data.length - 2].close) / data[data.length - 2].close) * 100 : 0,
    totalVolume: data.reduce((sum, d) => sum + d.volume, 0),
    averageVolume: data.length > 0 ? data.reduce((sum, d) => sum + d.volume, 0) / data.length : 0
  }
}