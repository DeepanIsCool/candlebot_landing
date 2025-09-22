import UpstoxClient from "upstox-js-sdk"

export interface UpstoxCandle {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface CandleData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockInfo {
  symbol: string
  name: string
  instrumentKey: string
}

// Common stock symbols with their instrument keys
export const POPULAR_STOCKS: StockInfo[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    instrumentKey: "NSE_EQ|INE002A01018"
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    instrumentKey: "NSE_EQ|INE467B01029"
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    instrumentKey: "NSE_EQ|INE040A01034"
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    instrumentKey: "NSE_EQ|INE009A01021"
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    instrumentKey: "NSE_EQ|INE090A01013"
  }
]

// Interval mappings for different timeframes
export const INTERVAL_CONFIG = {
  "1m": { interval: "minute", amount: "1" },
  "5m": { interval: "minute", amount: "5" },
  "15m": { interval: "minute", amount: "15" },
  "30m": { interval: "minute", amount: "30" },
  "1h": { interval: "hour", amount: "1" },
  "1D": { interval: "day", amount: "1" },
  "1W": { interval: "week", amount: "1" },
  "1M": { interval: "month", amount: "1" }
}

// Transform Upstox response to our candle format
function transformUpstoxData(upstoxData: any[]): CandleData[] {
  if (!upstoxData || !Array.isArray(upstoxData)) {
    return []
  }

  return upstoxData.map((candle) => {
    // Upstox returns data as [timestamp, open, high, low, close, volume, oi]
    const [timestamp, open, high, low, close, volume] = candle
    
    return {
      date: new Date(timestamp).toISOString().split('T')[0],
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
      volume: parseInt(volume) || 0
    }
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Get date range based on interval
function getDateRange(interval: string): { fromDate: string; toDate: string } {
  const today = new Date()
  const toDate = today.toISOString().split('T')[0]
  
  let fromDate: string
  const daysBack = {
    "1m": 1,
    "5m": 1,
    "15m": 5,
    "30m": 10,
    "1h": 30,
    "1D": 365,
    "1W": 730,
    "1M": 1095
  }
  
  const days = daysBack[interval as keyof typeof daysBack] || 30
  const from = new Date(today)
  from.setDate(from.getDate() - days)
  fromDate = from.toISOString().split('T')[0]
  
  return { fromDate, toDate }
}

// Fetch historical candle data
export async function fetchHistoricalData(
  instrumentKey: string,
  interval: string = "1D"
): Promise<CandleData[]> {
  try {
    const historyApi = new UpstoxClient.HistoricalApiV3()
    const config = INTERVAL_CONFIG[interval as keyof typeof INTERVAL_CONFIG] || INTERVAL_CONFIG["1D"]
    const { fromDate, toDate } = getDateRange(interval)

    console.log(`Fetching historical data for ${instrumentKey}, interval: ${interval}, from: ${fromDate}, to: ${toDate}`)

    const response = await historyApi.getHistoricalCandleV3(
      instrumentKey,
      config.interval,
      config.amount,
      fromDate,
      toDate
    )

    if (response && response.data && response.data.candles) {
      return transformUpstoxData(response.data.candles)
    }

    return []
  } catch (error) {
    console.error("Error fetching historical candle data:", error)
    // Return mock data for development/testing
    return generateMockData(interval)
  }
}

// Fetch intraday candle data
export async function fetchIntradayData(
  instrumentKey: string,
  interval: string = "1m"
): Promise<CandleData[]> {
  try {
    const intradayApi = new UpstoxClient.IntradayApiV3()
    const config = INTERVAL_CONFIG[interval as keyof typeof INTERVAL_CONFIG] || INTERVAL_CONFIG["1m"]

    console.log(`Fetching intraday data for ${instrumentKey}, interval: ${interval}`)

    const response = await intradayApi.getIntradayCandleV3(
      instrumentKey,
      config.interval,
      config.amount
    )

    if (response && response.data && response.data.candles) {
      return transformUpstoxData(response.data.candles)
    }

    return []
  } catch (error) {
    console.error("Error fetching intraday candle data:", error)
    // Return mock data for development/testing
    return generateMockData(interval)
  }
}

// Get stock data based on interval type
export async function getStockData(
  instrumentKey: string,
  interval: string = "1D"
): Promise<CandleData[]> {
  // Use intraday API for minute and hour intervals
  if (["1m", "5m", "15m", "30m", "1h"].includes(interval)) {
    return await fetchIntradayData(instrumentKey, interval)
  }
  
  // Use historical API for daily, weekly, monthly intervals
  return await fetchHistoricalData(instrumentKey, interval)
}

// Mock data generator for development/testing
function generateMockData(interval: string): CandleData[] {
  const days = {
    "1m": 1,
    "5m": 1,
    "15m": 5,
    "30m": 10,
    "1h": 30,
    "1D": 100,
    "1W": 52,
    "1M": 24
  }
  
  const numCandles = days[interval as keyof typeof days] || 30
  const mockData: CandleData[] = []
  let basePrice = 1000 + Math.random() * 2000
  
  for (let i = 0; i < numCandles; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (numCandles - i))
    
    const open = basePrice + (Math.random() - 0.5) * 20
    const volatility = 5 + Math.random() * 15
    const high = open + Math.random() * volatility
    const low = open - Math.random() * volatility
    const close = low + Math.random() * (high - low)
    
    mockData.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000
    })
    
    basePrice = close
  }
  
  return mockData
}
