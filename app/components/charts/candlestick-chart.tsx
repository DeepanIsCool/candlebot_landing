"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import * as d3 from "d3"

export interface Candle {
  date: string
  open: number
  high: number
  low: number
  close: number
}

interface Props {
  data: Candle[]
  width?: number
  height?: number
  smaPeriod?: number
}

const CandlestickChart: React.FC<Props> = ({ data, width = 800, height = 400, smaPeriod = 20 }) => {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data || data.length === 0) return

    const parseDate = d3.timeParse("%Y-%m-%d")
    const chartData = data.map((d) => ({
      ...d,
      date: parseDate(d.date) as Date,
    }))

    function SMA(values: typeof chartData, period: number): { date: Date; value: number | null }[] {
      return values.map((d, i, arr) => {
        if (i < period - 1) return { date: d.date, value: null }
        const slice = arr.slice(i - period + 1, i + 1)
        const avg = d3.mean(slice, (x) => x.close)
        return { date: d.date, value: avg ?? null }
      })
    }
    const smaData = SMA(chartData, smaPeriod)

    d3.select(svgRef.current).selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 30, left: 50 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height)

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand<Date>()
      .domain(chartData.map((d) => d.date))
      .range([0, chartWidth])
      .padding(0.3)

    const y = d3
      .scaleLinear()
      .domain([d3.min(chartData, (d: { low: any }) => d.low)!, d3.max(chartData, (d: { high: any }) => d.high)!])
      .nice()
      .range([chartHeight, 0])

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d") as any))

    g.append("g").call(d3.axisLeft(y))

    // Wicks
    g.selectAll(".candle-wick")
      .data(chartData)
      .enter()
      .append("line")
      .attr("class", "candle-wick")
      .attr("x1", (d: { date: any }) => (x(d.date) ?? 0) + x.bandwidth() / 2)
      .attr("x2", (d: { date: any }) => (x(d.date) ?? 0) + x.bandwidth() / 2)
      .attr("y1", (d: { high: any }) => y(d.high))
      .attr("y2", (d: { low: any }) => y(d.low))
      .attr("stroke", "black")

    // Candles
    g.selectAll(".candle-body")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "candle-body")
      .attr("x", (d: { date: any }) => x(d.date) ?? 0)
      .attr("y", (d: { open: any; close: any }) => y(Math.max(d.open, d.close)))
      .attr("width", x.bandwidth())
      .attr("height", (d: { open: any; close: any }) => Math.abs(y(d.open) - y(d.close)))
      .attr("fill", (d: { close: any; open: any }) => (d.close > d.open ? "green" : "red"))

    // SMA line
    const line = d3
      .line<{ date: Date; value: number | null }>()
      .defined((d: { value: any }) => d.value !== null)
      .x((d: { date: any }) => (x(d.date) ?? 0) + x.bandwidth() / 2)
      .y((d: { value: any }) => y(d.value!))

    g.append("path")
      .datum(smaData)
      .attr("class", "sma")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line)
  }, [data, width, height, smaPeriod])

  return <svg ref={svgRef}></svg>
}

export default CandlestickChart
