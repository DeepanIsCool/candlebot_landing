import UpstoxClient from "upstox-js-sdk"

async function fetchHistorical() {
  try {
    const historyApi = new UpstoxClient.HistoricalApiV3()
    const instrumentKey = "NSE_EQ|INE848E01016"
    const interval = "days"
    const interval_amount = "1"
    const fromDate = "2025-01-01"
    const toDate = "2025-01-02"

    const resp = await historyApi.getHistoricalCandleV3(instrumentKey, interval, interval_amount, fromDate, toDate)

    console.log("Historical data:", resp)
  } catch (error) {
    console.error("Error fetching historical candle data:", error)
  }
}

fetchHistorical()
