"use client"

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface InvestmentChartProps {
  data: any[]
  type: "line" | "pie" | "bar" | "area"
  colors?: string[]
  title?: string
}

const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"]

export function InvestmentChart({ data, type, colors = defaultColors, title }: InvestmentChartProps) {
  const chartConfig = {
    primary: {
      label: "Primary",
      color: colors[0],
    },
    secondary: {
      label: "Secondary",
      color: colors[1],
    },
    tertiary: {
      label: "Tertiary",
      color: colors[2],
    },
  }

  if (type === "line") {
    return (
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f9fafb",
              }}
            />
            <Line
              type="monotone"
              dataKey="invested"
              stroke={colors[1]}
              strokeWidth={3}
              dot={{ fill: colors[1], strokeWidth: 2, r: 4 }}
              name="Amount Invested"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              name="Worth of Investment"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }

  if (type === "pie") {
    return (
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={180}
              paddingAngle={5}
              dataKey="value"
              stroke="#1f2937"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f9fafb",
              }}
            />
            <Legend wrapperStyle={{ color: "#f9fafb" }} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }

  if (type === "area") {
    return (
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f9fafb",
              }}
            />
            <Area type="monotone" dataKey="value" stroke={colors[0]} fill={`${colors[0]}20`} strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
          <ChartTooltip
            content={<ChartTooltipContent />}
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#f9fafb",
            }}
          />
          <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
