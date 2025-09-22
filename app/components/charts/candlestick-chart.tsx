"use client";

import * as d3 from "d3";
import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface Props {
  data: Candle[];
  width?: number;
  height?: number;
  smaPeriod?: number;
  showVolume?: boolean;
  showSMA?: boolean;
  showMACD?: boolean;
  onCandleHover?: (candle: Candle | null) => void;
}

const CandlestickChart: React.FC<Props> = ({
  data,
  width = 800,
  height = 400,
  smaPeriod = 20,
  showVolume = true,
  showSMA = true,
  showMACD = false,
  onCandleHover,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const [dimensions, setDimensions] = useState({ width, height });

  // Responsive chart sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = Math.min(
          Math.max(containerWidth * 0.5, 300),
          600
        );
        setDimensions({
          width: containerWidth,
          height: containerHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const isDark = resolvedTheme === "dark";
    const colors = {
      background: isDark ? "#0a0a0a" : "#ffffff",
      text: isDark ? "#e5e5e5" : "#374151",
      grid: isDark ? "#374151" : "#e5e7eb",
      axis: isDark ? "#6b7280" : "#9ca3af",
      bullish: "#22c55e",
      bearish: "#ef4444",
      sma: "#3b82f6",
      volume: isDark ? "#4b5563" : "#d1d5db",
      volumeBar: isDark ? "#6b7280" : "#9ca3af",
      crosshair: isDark ? "#fbbf24" : "#f59e0b",
      tooltip: isDark ? "#1f2937" : "#f9fafb",
      tooltipBorder: isDark ? "#374151" : "#e5e7eb",
    };

    const parseDate = d3.timeParse("%Y-%m-%d");
    const chartData = data.map((d) => ({
      ...d,
      date: parseDate(d.date) as Date,
    }));

    function SMA(
      values: typeof chartData,
      period: number
    ): { date: Date; value: number | null }[] {
      return values.map((d, i, arr) => {
        if (i < period - 1) return { date: d.date, value: null };
        const slice = arr.slice(i - period + 1, i + 1);
        const avg = d3.mean(slice, (x) => x.close);
        return { date: d.date, value: avg ?? null };
      });
    }

    function EMA(
      values: typeof chartData,
      period: number
    ): { date: Date; value: number | null }[] {
      const multiplier = 2 / (period + 1);
      return values.map((d, i, arr) => {
        if (i === 0) return { date: d.date, value: d.close };
        if (i < period - 1) return { date: d.date, value: null };

        let ema = d.close;
        if (i >= period - 1) {
          const prevEma = arr[i - 1] ? values[i - 1].close : d.close;
          ema = d.close * multiplier + prevEma * (1 - multiplier);
        }
        return { date: d.date, value: ema };
      });
    }

    function MACD(values: typeof chartData): {
      date: Date;
      macd: number | null;
      signal: number | null;
      histogram: number | null;
    }[] {
      const ema12 = EMA(values, 12);
      const ema26 = EMA(values, 26);

      const macdLine = values.map((d, i) => {
        const ema12Val = ema12[i]?.value;
        const ema26Val = ema26[i]?.value;
        if (ema12Val && ema26Val) {
          return { date: d.date, value: ema12Val - ema26Val };
        }
        return { date: d.date, value: null };
      });

      const signalLine = EMA(
        macdLine.map((d) => ({
          date: d.date,
          close: d.value || 0,
          open: 0,
          high: 0,
          low: 0,
        })),
        9
      );

      return values.map((d, i) => ({
        date: d.date,
        macd: macdLine[i]?.value || null,
        signal: signalLine[i]?.value || null,
        histogram:
          macdLine[i]?.value && signalLine[i]?.value
            ? macdLine[i].value! - signalLine[i].value!
            : null,
      }));
    }

    const smaData = SMA(chartData, smaPeriod);
    const macdData = showMACD ? MACD(chartData) : [];

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = {
      top: 10,
      right: 50,
      bottom: showVolume ? 30 : 20,
      left: 50,
    };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    // Calculate space allocation - MACD now renders in main chart area
    const volumeHeight = showVolume ? 60 : 0;
    const candleHeight = chartHeight - volumeHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .style("background", colors.background);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleBand<Date>()
      .domain(chartData.map((d) => d.date))
      .range([0, chartWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(chartData, (d) => d.low)! * 0.99,
        d3.max(chartData, (d) => d.high)! * 1.01,
      ])
      .nice()
      .range([candleHeight, 0]);

    const volumeScale = showVolume
      ? d3
          .scaleLinear()
          .domain([0, d3.max(chartData, (d) => d.volume || 0)!])
          .range([chartHeight, candleHeight + 5])
      : null;

    // MACD scale - now uses candle area with smaller range for overlay
    const macdScale = showMACD
      ? d3
          .scaleLinear()
          .domain(d3.extent(macdData, (d) => d.macd) as [number, number])
          .range([candleHeight * 0.8, candleHeight * 0.2]) // Use 20-80% of candle height
      : null;

    // Grid lines
    const gridGroup = g.append("g").attr("class", "grid");

    // Horizontal grid lines
    gridGroup
      .selectAll(".grid-horizontal")
      .data(y.ticks(6))
      .enter()
      .append("line")
      .attr("class", "grid-horizontal")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", colors.grid)
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3);

    // Vertical grid lines
    gridGroup
      .selectAll(".grid-vertical")
      .data(
        chartData.filter((_, i) => i % Math.ceil(chartData.length / 8) === 0)
      )
      .enter()
      .append("line")
      .attr("class", "grid-vertical")
      .attr("x1", (d) => (x(d.date) ?? 0) + x.bandwidth() / 2)
      .attr("x2", (d) => (x(d.date) ?? 0) + x.bandwidth() / 2)
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", colors.grid)
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3);

    // Volume bars (if enabled)
    if (showVolume && volumeScale) {
      g.selectAll(".volume-bar")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "volume-bar")
        .attr("x", (d) => x(d.date) ?? 0)
        .attr("y", (d) => volumeScale(d.volume || 0))
        .attr("width", x.bandwidth())
        .attr("height", (d) => chartHeight - volumeScale(d.volume || 0))
        .attr("fill", colors.volumeBar)
        .attr("opacity", 0.3);
    }

    // Candlestick wicks
    g.selectAll(".candle-wick")
      .data(chartData)
      .enter()
      .append("line")
      .attr("class", "candle-wick")
      .attr("x1", (d) => (x(d.date) ?? 0) + x.bandwidth() / 2)
      .attr("x2", (d) => (x(d.date) ?? 0) + x.bandwidth() / 2)
      .attr("y1", (d) => y(d.high))
      .attr("y2", (d) => y(d.low))
      .attr("stroke", colors.text)
      .attr("stroke-width", 1);

    // Candlestick bodies
    const candles = g
      .selectAll(".candle-body")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "candle-body")
      .attr("x", (d) => x(d.date) ?? 0)
      .attr("y", (d) => y(Math.max(d.open, d.close)))
      .attr("width", x.bandwidth())
      .attr("height", (d) => Math.max(1, Math.abs(y(d.open) - y(d.close))))
      .attr("fill", (d) => (d.close > d.open ? colors.bullish : colors.bearish))
      .attr("stroke", (d) =>
        d.close > d.open ? colors.bullish : colors.bearish
      )
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer");

    // SMA line (if enabled)
    if (showSMA) {
      const line = d3
        .line<{ date: Date; value: number | null }>()
        .defined((d) => d.value !== null)
        .x((d) => (x(d.date) ?? 0) + x.bandwidth() / 2)
        .y((d) => y(d.value!))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(smaData)
        .attr("class", "sma")
        .attr("fill", "none")
        .attr("stroke", colors.sma)
        .attr("stroke-width", 2)
        .attr("opacity", 0.8)
        .attr("d", line);
    }

    // MACD indicator (if enabled) - renders as overlay in main chart
    if (showMACD && macdScale) {
      // MACD background area
      g.append("rect")
        .attr("x", 0)
        .attr("y", candleHeight * 0.2)
        .attr("width", chartWidth)
        .attr("height", candleHeight * 0.6)
        .attr("fill", isDark ? "#1f2937" : "#f9fafb")
        .attr("opacity", 0.3)
        .attr("rx", 4);

      // MACD zero line
      const zeroY = macdScale(0);
      g.append("line")
        .attr("x1", 0)
        .attr("x2", chartWidth)
        .attr("y1", zeroY)
        .attr("y2", zeroY)
        .attr("stroke", colors.grid)
        .attr("stroke-width", 1)
        .attr("opacity", 0.5)
        .attr("stroke-dasharray", "3,3");

      // MACD line
      const macdLine = d3
        .line<{ date: Date; macd: number | null }>()
        .defined((d) => d.macd !== null)
        .x((d) => (x(d.date) ?? 0) + x.bandwidth() / 2)
        .y((d) => macdScale(d.macd!))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(macdData)
        .attr("class", "macd-line")
        .attr("fill", "none")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8)
        .attr("d", macdLine);

      // Signal line
      const signalLine = d3
        .line<{ date: Date; signal: number | null }>()
        .defined((d) => d.signal !== null)
        .x((d) => (x(d.date) ?? 0) + x.bandwidth() / 2)
        .y((d) => macdScale(d.signal!))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(macdData)
        .attr("class", "signal-line")
        .attr("fill", "none")
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8)
        .attr("d", signalLine);

      // MACD histogram
      g.selectAll(".macd-histogram")
        .data(macdData.filter((d) => d.histogram !== null))
        .enter()
        .append("rect")
        .attr("class", "macd-histogram")
        .attr("x", (d) => (x(d.date) ?? 0) + x.bandwidth() * 0.25)
        .attr("y", (d) => Math.min(zeroY, macdScale(d.histogram!)))
        .attr("width", x.bandwidth() * 0.5)
        .attr("height", (d) => Math.abs(zeroY - macdScale(d.histogram!)))
        .attr("fill", (d) => (d.histogram! >= 0 ? "#22c55e" : "#ef4444"))
        .attr("opacity", 0.3);

      // MACD labels
      g.append("text")
        .attr("x", 5)
        .attr("y", candleHeight * 0.25)
        .attr("font-size", "10px")
        .attr("fill", colors.text)
        .attr("opacity", 0.7)
        .text("MACD");
    }

    // Axes
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${candleHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => {
            const date = d as Date;
            if (chartData.length > 50) {
              return d3.timeFormat("%m/%d")(date);
            }
            return d3.timeFormat("%m/%d/%y")(date);
          })
          .tickValues(
            chartData
              .filter((_, i) => i % Math.ceil(chartData.length / 8) === 0)
              .map((d) => d.date)
          )
      );

    xAxis
      .selectAll("text")
      .style("fill", colors.text)
      .style("font-size", "12px");

    xAxis.selectAll("path, line").style("stroke", colors.axis);

    const yAxis = g
      .append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2f")).ticks(6));

    yAxis
      .selectAll("text")
      .style("fill", colors.text)
      .style("font-size", "12px");

    yAxis.selectAll("path, line").style("stroke", colors.axis);

    // Right axis for current price
    const rightAxis = g
      .append("g")
      .attr("transform", `translate(${chartWidth},0)`)
      .call(d3.axisRight(y).tickFormat(d3.format(".2f")).ticks(6));

    rightAxis
      .selectAll("text")
      .style("fill", colors.text)
      .style("font-size", "12px");

    rightAxis.selectAll("path, line").style("stroke", colors.axis);

    // Volume axis (if enabled)
    if (showVolume && volumeScale) {
      const volumeAxis = g
        .append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(
          d3
            .axisBottom(
              d3
                .scaleLinear()
                .domain([0, d3.max(chartData, (d) => d.volume || 0)!])
                .range([0, chartWidth])
            )
            .tickFormat(d3.format(".2s"))
            .ticks(4)
        );

      volumeAxis
        .selectAll("text")
        .style("fill", colors.text)
        .style("font-size", "10px");

      volumeAxis.selectAll("path, line").style("stroke", colors.axis);
    }

    // Crosshair and tooltip
    const crosshair = g
      .append("g")
      .attr("class", "crosshair")
      .style("display", "none");

    const crosshairX = crosshair
      .append("line")
      .attr("class", "crosshair-x")
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", colors.crosshair)
      .attr("stroke-width", 1)
      .attr("opacity", 0.7);

    const crosshairY = crosshair
      .append("line")
      .attr("class", "crosshair-y")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("stroke", colors.crosshair)
      .attr("stroke-width", 1)
      .attr("opacity", 0.7);

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "chart-tooltip")
      .style("position", "absolute")
      .style("padding", "12px")
      .style("background", colors.tooltip)
      .style("border", `1px solid ${colors.tooltipBorder}`)
      .style("border-radius", "8px")
      .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("font-size", "12px")
      .style("color", colors.text)
      .style("z-index", "1000");

    // Mouse interaction
    const overlay = g
      .append("rect")
      .attr("class", "overlay")
      .attr("width", chartWidth)
      .attr("height", candleHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => {
        crosshair.style("display", null);
      })
      .on("mouseout", () => {
        crosshair.style("display", "none");
        tooltip.style("opacity", 0);
        onCandleHover?.(null);
      })
      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(event);

        // Find the closest candle
        const date = x.domain().find((d) => {
          const bandStart = x(d) ?? 0;
          const bandEnd = bandStart + x.bandwidth();
          return mouseX >= bandStart && mouseX <= bandEnd;
        });

        if (date) {
          const candle = chartData.find(
            (d) => d.date.getTime() === date.getTime()
          );
          if (candle) {
            // Update crosshair
            crosshairX.attr("x1", mouseX).attr("x2", mouseX);
            crosshairY.attr("y1", mouseY).attr("y2", mouseY);

            // Update tooltip
            const formatDate = d3.timeFormat("%B %d, %Y");
            const formatPrice = d3.format(".2f");
            const formatVolume = d3.format(".2s");

            const change = candle.close - candle.open;
            const changePercent = (change / candle.open) * 100;
            const changeColor = change >= 0 ? colors.bullish : colors.bearish;

            tooltip
              .html(
                `
              <div style="font-weight: bold; margin-bottom: 4px;">${formatDate(
                candle.date
              )}</div>
              <div>Open: ₹${formatPrice(candle.open)}</div>
              <div>High: ₹${formatPrice(candle.high)}</div>
              <div>Low: ₹${formatPrice(candle.low)}</div>
              <div>Close: ₹${formatPrice(candle.close)}</div>
              <div style="color: ${changeColor};">
                Change: ${change >= 0 ? "+" : ""}₹${formatPrice(change)} (${
                  change >= 0 ? "+" : ""
                }${changePercent.toFixed(2)}%)
              </div>
              ${
                candle.volume
                  ? `<div>Volume: ${formatVolume(candle.volume)}</div>`
                  : ""
              }
            `
              )
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 10 + "px")
              .style("opacity", 1);

            onCandleHover?.({
              ...candle,
              date: candle.date.toISOString().split("T")[0],
            });
          }
        }
      });

    // Cleanup tooltip on unmount
    return () => {
      d3.selectAll(".chart-tooltip").remove();
    };
  }, [
    data,
    dimensions,
    resolvedTheme,
    smaPeriod,
    showVolume,
    showSMA,
    showMACD,
    onCandleHover,
  ]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full h-auto"></svg>
    </div>
  );
};

export default CandlestickChart;
