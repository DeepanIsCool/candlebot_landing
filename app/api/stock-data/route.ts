import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const instrumentKey = searchParams.get('instrumentKey')
  const interval = searchParams.get('interval') || '1D'
  const fromDate = searchParams.get('fromDate')
  const toDate = searchParams.get('toDate')

  if (!instrumentKey || !fromDate || !toDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: instrumentKey, fromDate, toDate' },
      { status: 400 }
    )
  }

  // Interval configuration for Upstox V3 API
  const intervalConfig: { [key: string]: { unit: string; value: string } } = {
    "5m": { unit: "minutes", value: "5" },
    "15m": { unit: "minutes", value: "15" },
    "30m": { unit: "minutes", value: "30" },
    "1h": { unit: "hours", value: "1" },
    "1D": { unit: "days", value: "1" },
    "1W": { unit: "weeks", value: "1" },
    "1M": { unit: "months", value: "1" }
  }

  const config = intervalConfig[interval] || intervalConfig["1D"]
  
  try {
    const encodedInstrumentKey = encodeURIComponent(instrumentKey)
    
    // Use V3 Historical API for all intervals - it supports minutes/hours for recent periods
    const upstoxUrl = `https://api.upstox.com/v3/historical-candle/${encodedInstrumentKey}/${config.unit}/${config.value}/${toDate}/${fromDate}`
    
    console.log(`🔄 Proxying request to Upstox V3 Historical API: ${upstoxUrl}`)
    
    const response = await fetch(upstoxUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'MoneyStocks/1.0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Upstox V3 API Error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json(
        { error: `Upstox V3 API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Add CORS headers to allow frontend access
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch from Upstox V3 API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock data from Upstox V3 API' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
