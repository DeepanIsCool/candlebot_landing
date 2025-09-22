"use client";

import CandlestickChart, {
  type Candle,
} from "@/components/charts/candlestick-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

// Mock data for demonstration
const mockStockData: Candle[] = [
  { date: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
  { date: "2024-01-02", open: 105, high: 115, low: 100, close: 112 },
  { date: "2024-01-03", open: 112, high: 118, low: 108, close: 115 },
  { date: "2024-01-04", open: 115, high: 120, low: 110, close: 108 },
  { date: "2024-01-05", open: 108, high: 113, low: 105, close: 111 },
  { date: "2024-01-06", open: 111, high: 125, low: 109, close: 122 },
  { date: "2024-01-07", open: 122, high: 128, low: 118, close: 125 },
];

const nseStocks = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 2456.75,
    change: 2.34,
    changePercent: 0.95,
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    price: 3789.2,
    change: -15.8,
    changePercent: -0.42,
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    price: 1678.9,
    change: 8.45,
    changePercent: 0.51,
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    price: 1456.3,
    change: 12.75,
    changePercent: 0.88,
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    price: 987.65,
    change: -3.2,
    changePercent: -0.32,
  },
];

export function StockSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState(nseStocks[0]);
  const [timeframe, setTimeframe] = useState("1D");
  const [filteredStocks, setFilteredStocks] = useState(nseStocks);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = nseStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStocks(filtered);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Live Market Data
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time NSE stock data with advanced charting and market analysis
          </p>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
          {/* Left Panel - Stock Selection & Top Movers */}
          <div className="xl:col-span-2 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/70 w-5 h-5 z-10" />
              <Input
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 h-12 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-md border-2 border-primary/20 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:border-primary/40 font-medium"
              />
              {searchQuery && filteredStocks.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto">
                  {filteredStocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => {
                        setSelectedStock(stock);
                        setSearchQuery("");
                        setFilteredStocks(nseStocks);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-primary/10 flex items-center justify-between group transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div>
                        <div className="text-foreground font-medium text-sm">
                          {stock.symbol}
                        </div>
                        <div className="text-muted-foreground text-xs truncate">
                          {stock.name.length > 20
                            ? stock.name.substring(0, 20) + "..."
                            : stock.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-foreground text-sm">
                          ₹{stock.price.toFixed(0)}
                        </div>
                        <div
                          className={`text-xs ${
                            stock.change >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {stock.changePercent.toFixed(1)}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Top Movers */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-lg flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                  Top Movers
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {nseStocks.slice(0, 5).map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 ${
                        selectedStock.symbol === stock.symbol
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-accent/30"
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-foreground font-medium text-sm">
                          {stock.symbol}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          ₹{stock.price.toFixed(0)}
                        </div>
                      </div>
                      <div
                        className={`text-right ${
                          stock.change >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        <div className="font-semibold text-sm">
                          {stock.changePercent.toFixed(1)}%
                        </div>
                        <div className="text-xs">
                          {stock.change >= 0 ? "+" : ""}
                          {stock.change.toFixed(1)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Chart */}
          <div className="xl:col-span-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg h-full">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-foreground text-xl mb-1">
                      {selectedStock.symbol}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {selectedStock.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        ₹{selectedStock.price.toFixed(2)}
                      </div>
                      <div
                        className={`flex items-center justify-end gap-1 text-sm ${
                          selectedStock.change >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {selectedStock.change >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {selectedStock.change >= 0 ? "+" : ""}
                          {selectedStock.change.toFixed(2)} (
                          {selectedStock.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-20 h-8 bg-muted/50 border-border/50 text-foreground text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/50">
                        <SelectItem value="1D">1D</SelectItem>
                        <SelectItem value="1W">1W</SelectItem>
                        <SelectItem value="1M">1M</SelectItem>
                        <SelectItem value="3M">3M</SelectItem>
                        <SelectItem value="1Y">1Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                  <CandlestickChart
                    data={mockStockData}
                    width={1000}
                    height={380}
                    smaPeriod={5}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Market Info */}
          <div className="xl:col-span-2">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-lg flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-primary" />
                  Market Info
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        Open
                      </div>
                      <div className="text-foreground font-semibold text-sm">
                        ₹
                        {(selectedStock.price - selectedStock.change).toFixed(
                          2
                        )}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        High
                      </div>
                      <div className="text-foreground font-semibold text-sm">
                        ₹{(selectedStock.price + 15.3).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        Low
                      </div>
                      <div className="text-foreground font-semibold text-sm">
                        ₹{(selectedStock.price - 8.75).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        Volume
                      </div>
                      <div className="text-foreground font-semibold text-sm">
                        2.4M
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        Market Cap
                      </span>
                      <span className="text-foreground font-semibold text-sm">
                        ₹15.2L Cr
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        P/E Ratio
                      </span>
                      <span className="text-foreground font-semibold text-sm">
                        24.5
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        52W High
                      </span>
                      <span className="text-foreground font-semibold text-sm">
                        ₹{(selectedStock.price + 245).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        52W Low
                      </span>
                      <span className="text-foreground font-semibold text-sm">
                        ₹{(selectedStock.price - 156).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
