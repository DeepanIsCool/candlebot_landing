// Upstox V3 API - No authentication required for historical data
// API Documentation: https://upstox.com/developer/api-documentation/v3/get-historical-candle-data

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

// Upstox V3 API Response format
interface UpstoxV3Response {
  status: string
  data: {
    candles: Array<[string, number, number, number, number, number, number]> // [timestamp, open, high, low, close, volume, oi]
  }
}

// Common stock symbols with their correct instrument keys
// These are verified working instrument keys from Upstox V3 API
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
    instrumentKey: "NSE_EQ|INE090A01021"  // Corrected ISIN
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    instrumentKey: "NSE_EQ|INE062A01020"
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    instrumentKey: "NSE_EQ|INE397D01024"
  }
]

// Upstox V3 API interval mappings - Based on API limitations
export const INTERVAL_CONFIG = {
  "5m": { unit: "minutes", value: "5" },    // 5-minute intervals
  "15m": { unit: "minutes", value: "15" },  // 15-minute intervals
  "30m": { unit: "minutes", value: "30" },  // 30-minute intervals
  "1h": { unit: "hours", value: "1" },      // 1-hour intervals
  "1D": { unit: "days", value: "1" },       // Daily intervals
  "1W": { unit: "weeks", value: "1" },      // Weekly intervals
  "1M": { unit: "months", value: "1" }      // Monthly intervals
}

// Transform Upstox V3 API response to our candle format
function transformUpstoxV3Data(candles: Array<[string, number, number, number, number, number, number]>): CandleData[] {
  if (!candles || !Array.isArray(candles)) {
    console.warn('Invalid Upstox V3 candle data format:', candles)
    return []
  }

  console.log(`📊 Processing ${candles.length} candles from Upstox V3 API`)

  const transformedData = candles.map((candle, index) => {
    try {
      // Upstox V3 returns data as [timestamp, open, high, low, close, volume, oi]
      const [timestamp, open, high, low, close, volume] = candle
      
      // Parse timestamp - Upstox V3 returns ISO format like "2024-09-22T09:15:00+05:30"
      const date = new Date(timestamp).toISOString().split('T')[0]
      
      const candleData: CandleData = {
        date,
        open: parseFloat(open.toString()),
        high: parseFloat(high.toString()),
        low: parseFloat(low.toString()),
        close: parseFloat(close.toString()),
        volume: parseInt(volume.toString())
      }
      
      // Validate candle data integrity
      if (candleData.high < candleData.low) {
        console.warn(`⚠️ Invalid candle at index ${index}: high (${candleData.high}) < low (${candleData.low})`)
        return null
      }
      
      if (candleData.open < candleData.low || candleData.open > candleData.high) {
        console.warn(`⚠️ Invalid candle at index ${index}: open (${candleData.open}) outside range [${candleData.low}, ${candleData.high}]`)
        return null
      }
      
      if (candleData.close < candleData.low || candleData.close > candleData.high) {
        console.warn(`⚠️ Invalid candle at index ${index}: close (${candleData.close}) outside range [${candleData.low}, ${candleData.high}]`)
        return null
      }
      
      return candleData
    } catch (error) {
      console.error(`❌ Error transforming candle at index ${index}:`, error, candle)
      return null
    }
  }).filter((candle): candle is CandleData => candle !== null)

  const sortedData = transformedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  console.log(`✅ Successfully processed ${sortedData.length} valid candles`)
  
  return sortedData
}

// Get date range based on interval for Upstox V3 API
function getDateRange(interval: string): { fromDate: string; toDate: string } {
  const today = new Date()
  
  // Use previous trading day if today is weekend or after market hours
  const dayOfWeek = today.getDay()
  let toDate: string
  
  if (dayOfWeek === 0) { // Sunday
    today.setDate(today.getDate() - 2) // Friday
  } else if (dayOfWeek === 6) { // Saturday
    today.setDate(today.getDate() - 1) // Friday
  }
  
  toDate = today.toISOString().split('T')[0]
  
  // Upstox V3 API limitations and optimal ranges
  const daysBack = {
    "5m": 3,     // 5-minute: 3 days (limited historical data for minutes)
    "15m": 7,    // 15-minute: 1 week
    "30m": 15,   // 30-minute: 2 weeks
    "1h": 30,    // 1-hour: 1 month
    "1D": 100,   // 1-day: 100 trading days
    "1W": 730,   // 1-week: 2 years
    "1M": 1095   // 1-month: 3 years
  }
  
  const days = daysBack[interval as keyof typeof daysBack] || 30
  const from = new Date(today)
  from.setDate(from.getDate() - days)
  const fromDate = from.toISOString().split('T')[0]
  
  console.log(`📅 Date range: ${fromDate} to ${toDate}`)
  return { fromDate, toDate }
}

// Fetch historical candle data using Upstox V3 API (no authentication required)
export async function fetchHistoricalData(
  instrumentKey: string,
  interval: string = "1D"
): Promise<CandleData[]> {
  try {
    console.log(`🔄 Fetching historical data from Upstox V3 API for ${instrumentKey}, interval: ${interval}`)
    
    const config = INTERVAL_CONFIG[interval as keyof typeof INTERVAL_CONFIG] || INTERVAL_CONFIG["1D"]
    const { fromDate, toDate } = getDateRange(interval)
    
    // Construct Upstox V3 API URL
    // Format: https://api.upstox.com/v3/historical-candle/{instrument_key}/{unit}/{value}/{to_date}/{from_date}
    const encodedInstrumentKey = encodeURIComponent(instrumentKey)
    const url = `https://api.upstox.com/v3/historical-candle/${encodedInstrumentKey}/${config.unit}/${config.value}/${toDate}/${fromDate}`
    
    console.log(`📡 API URL: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ HTTP ${response.status}: ${response.statusText}`, errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
    }
    
    const data: UpstoxV3Response = await response.json()
    
    // Check for API-level errors
    if (data.status === 'error') {
      const errorMsg = (data as any).errors?.[0]?.message || 'Unknown API error'
      console.error(`❌ Upstox API Error:`, errorMsg)
      throw new Error(`Upstox API Error: ${errorMsg}`)
    }
    
    if (data.status === 'success' && data.data && data.data.candles) {
      console.log(`✅ Successfully fetched ${data.data.candles.length} historical candles from Upstox V3`)
      return transformUpstoxV3Data(data.data.candles)
    }
    
    console.warn("⚠️ No candle data in Upstox V3 response or status not success")
    throw new Error('No candle data available')
    
  } catch (error) {
    console.error(`❌ Failed to fetch historical data from Upstox V3:`, error)
    throw error // Re-throw to let caller handle
  }
}

// Fetch intraday candle data using Upstox V3 API (no authentication required)
export async function fetchIntradayData(
  instrumentKey: string,
  interval: string = "5m"
): Promise<CandleData[]> {
  try {
    console.log(`🔄 Fetching intraday data from Upstox V3 API for ${instrumentKey}, interval: ${interval}`)
    
    const config = INTERVAL_CONFIG[interval as keyof typeof INTERVAL_CONFIG] || INTERVAL_CONFIG["5m"]
    
    // For intraday, we use today's date
    const today = new Date().toISOString().split('T')[0]
    
    // Construct Upstox V3 API URL for intraday
    const encodedInstrumentKey = encodeURIComponent(instrumentKey)
    const url = `https://api.upstox.com/v3/historical-candle/${encodedInstrumentKey}/${config.unit}/${config.value}/${today}/${today}`
    
    console.log(`📡 Intraday API URL: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ HTTP ${response.status}: ${response.statusText}`, errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
    }
    
    const data: UpstoxV3Response = await response.json()
    
    // Check for API-level errors
    if (data.status === 'error') {
      const errorMsg = (data as any).errors?.[0]?.message || 'Unknown API error'
      console.error(`❌ Upstox API Error:`, errorMsg)
      throw new Error(`Upstox API Error: ${errorMsg}`)
    }
    
    if (data.status === 'success' && data.data && data.data.candles) {
      console.log(`✅ Successfully fetched ${data.data.candles.length} intraday candles from Upstox V3`)
      return transformUpstoxV3Data(data.data.candles)
    }
    
    console.warn("⚠️ No intraday candle data in Upstox V3 response")
    throw new Error('No intraday candle data available')
    
  } catch (error) {
    console.error(`❌ Failed to fetch intraday data from Upstox V3:`, error)
    throw error // Re-throw to let caller handle
  }
}

// Get stock data based on interval type using Upstox V3 API
export async function getStockData(
  instrumentKey: string,
  interval: string = "1D"
): Promise<CandleData[]> {
  console.log(`📈 Getting stock data for ${instrumentKey} with ${interval} interval`)
  
  try {
    // For intraday intervals (minutes and hours), use historical API with same day
    if (["5m", "15m", "30m", "1h"].includes(interval)) {
      return await fetchIntradayData(instrumentKey, interval)
    }
    
    // For daily, weekly, monthly intervals, fetch historical data
    return await fetchHistoricalData(instrumentKey, interval)
  } catch (error) {
    console.error(`❌ Failed to get stock data for ${instrumentKey}:`, error)
    // Return empty array instead of mock data as requested
    return []
  }
}

// Get Last Traded Price (LTP) from the latest candle data
export function getLTPFromData(data: CandleData[]): number {
  if (!data || data.length === 0) {
    return 0
  }
  
  // Sort by date to get the most recent candle
  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const latestCandle = sortedData[0]
  
  console.log(`📊 LTP from latest candle (${latestCandle.date}): ₹${latestCandle.close}`)
  return latestCandle.close
}

// Get price change and percentage from data
export function getPriceChangeFromData(data: CandleData[]): { change: number; changePercent: number } {
  if (!data || data.length < 2) {
    return { change: 0, changePercent: 0 }
  }
  
  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const latestCandle = sortedData[0]
  const previousCandle = sortedData[1]
  
  const change = latestCandle.close - previousCandle.close
  const changePercent = (change / previousCandle.close) * 100
  
  console.log(`📈 Price change: ₹${change.toFixed(2)} (${changePercent.toFixed(2)}%)`)
  return { change, changePercent }
}
