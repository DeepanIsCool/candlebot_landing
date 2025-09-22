"use client";

import CandlestickChart, {
  type Candle,
} from "@/app/components/charts/candlestick-chart";
import {
  POPULAR_STOCKS,
  type StockInfo,
} from "@/app/components/lib/api/upstox-client";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useStockData, useStockStats } from "@/app/hooks/use-stock-data";
import {
  Activity,
  Loader2,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

const timeframeOptions = [
  { value: "1m", label: "1M" },
  { value: "5m", label: "5M" },
  { value: "15m", label: "15M" },
  { value: "30m", label: "30M" },
  { value: "1h", label: "1H" },
  { value: "1D", label: "1D" },
  { value: "1W", label: "1W" },
  { value: "1M", label: "1Mo" },
];

export function StockSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState(POPULAR_STOCKS);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [showVolume, setShowVolume] = useState(true);
  const [showMACD, setShowMACD] = useState(false);

  const {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    currentStock,
    currentInterval,
    setStock,
    setInterval,
  } = useStockData(POPULAR_STOCKS[0], "1D", {
    refreshInterval: 30000,
    enableAutoRefresh: true,
  });

  const stats = useStockStats(data);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = POPULAR_STOCKS.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStocks(filtered);
  };

  const handleStockSelect = (stock: StockInfo) => {
    setStock(stock);
    setSearchQuery("");
    setFilteredStocks(POPULAR_STOCKS);
  };

  const handleSearchSelect = (stock: StockInfo) => {
    handleStockSelect(stock);
  };

  // Format numbers for display
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const formatChange = (change: number) =>
    `${change >= 0 ? "+" : ""}${change.toFixed(2)}`;
  const formatPercent = (percent: number) =>
    `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
  const formatVolume = (volume: number) => {
    if (volume >= 10000000) return `${(volume / 10000000).toFixed(1)}Cr`;
    if (volume >= 100000) return `${(volume / 100000).toFixed(1)}L`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <section className="py-6 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Live Market Data
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time NSE stock data with advanced charting and market analysis
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-center">
            <p>{error}</p>
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-4">
          {/* Left Panel - Stock Selection & Top Movers */}
          <div className="xl:col-span-2 space-y-3">
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
                      onClick={() => handleStockSelect(stock)}
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
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stock Selection */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-lg flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                  Available Stocks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="space-y-2">
                  {POPULAR_STOCKS.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleStockSelect(stock)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 ${
                        currentStock.symbol === stock.symbol
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-accent/30"
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-foreground font-medium text-sm">
                          {stock.symbol}
                        </div>
                        <div className="text-muted-foreground text-xs truncate">
                          {stock.name.length > 15
                            ? stock.name.substring(0, 15) + "..."
                            : stock.name}
                        </div>
                      </div>
                      {currentStock.symbol === stock.symbol && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
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
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-foreground text-xl mb-1 flex items-center gap-2">
                        {currentStock.symbol}
                        {loading && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {currentStock.name}
                      </p>
                    </div>
                    <Button
                      onClick={refreshData}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="ml-auto sm:ml-0"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {formatPrice(
                          hoveredCandle?.close || stats.currentPrice
                        )}
                      </div>
                      <div
                        className={`flex items-center justify-end gap-1 text-sm ${
                          stats.change >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {stats.change >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {formatChange(stats.change)} (
                        {formatPercent(stats.changePercent)})
                      </div>
                    </div>
                    <Select value={currentInterval} onValueChange={setInterval}>
                      <SelectTrigger className="w-20 h-8 bg-muted/50 border-border/50 text-foreground text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/50">
                        {timeframeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4">
                {/* Chart Controls */}
                <div className="flex items-center gap-4 mb-3 p-2 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showVolume"
                      checked={showVolume}
                      onCheckedChange={(checked) =>
                        setShowVolume(checked === true)
                      }
                    />
                    <label
                      htmlFor="showVolume"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Volume
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showMACD"
                      checked={showMACD}
                      onCheckedChange={(checked) =>
                        setShowMACD(checked === true)
                      }
                    />
                    <label
                      htmlFor="showMACD"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      MACD
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg p-1 min-h-[450px] flex items-center justify-center">
                  {loading && data.length === 0 ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Loading chart data...
                    </div>
                  ) : (
                    <CandlestickChart
                      data={data}
                      height={450}
                      smaPeriod={20}
                      showVolume={showVolume}
                      showSMA={true}
                      showMACD={showMACD}
                      onCandleHover={setHoveredCandle}
                    />
                  )}
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
                        {formatPrice(hoveredCandle?.open || stats.openPrice)}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        High
                      </div>
                      <div className="text-foreground font-semibold text-sm">
                        {formatPrice(hoveredCandle?.high || stats.highPrice)}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        Low
                      </div>
                      <div className="text-foreground font-semibold text-sm">
                        {formatPrice(hoveredCandle?.low || stats.lowPrice)}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        Volume
                      </div>
                      <div className="text-foreground font-semibold text-sm">
                        {formatVolume(hoveredCandle?.volume || stats.volume)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        Total Volume
                      </span>
                      <span className="text-foreground font-semibold text-sm">
                        {formatVolume(stats.totalVolume)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        Avg Volume
                      </span>
                      <span className="text-foreground font-semibold text-sm">
                        {formatVolume(stats.averageVolume)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        Data Points
                      </span>
                      <span className="text-foreground font-semibold text-sm">
                        {data.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        Interval
                      </span>
                      <span className="text-foreground font-semibold text-sm">
                        {currentInterval}
                      </span>
                    </div>
                  </div>

                  {/* Current candle details when hovering */}
                  {hoveredCandle && (
                    <div className="border-t border-border/50 pt-4">
                      <div className="text-sm font-medium text-foreground mb-2">
                        Selected Candle
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(hoveredCandle.date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
