"use client";

import { cn } from "@/app/components/lib/utils";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    title: "Smart Trading, Smarter Profits",
    subtitle: "Advanced Analytics for Modern Investors",
    description:
      "Harness the power of AI-driven insights and real-time market data to make informed investment decisions.",
    cta: "Start Trading",
    image: "/modern-trading-dashboard-with-charts-and-graphs.jpg",
    gradient: "from-blue-600 via-blue-500 to-cyan-400",
  },
  {
    id: 2,
    title: "Calculate Your Financial Future",
    subtitle: "Comprehensive Investment Calculators",
    description:
      "Plan your investments with precision using our suite of advanced calculators for SIP, FD, tax planning, and more.",
    cta: "Explore Calculators",
    image: "/financial-calculator-interface-with-charts-and-num.jpg",
    gradient: "from-cyan-500 via-teal-500 to-blue-500",
  },
  {
    id: 3,
    title: "Real-Time Market Intelligence",
    subtitle: "Live Data, Instant Decisions",
    description:
      "Access live NSE data, advanced charting tools, and market insights to stay ahead of the curve.",
    cta: "View Markets",
    image: "/stock-market-candlestick-charts-with-real-time-dat.jpg",
    gradient: "from-indigo-600 via-purple-500 to-blue-500",
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-all duration-1000",
          slides[currentSlide].gradient
        )}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-white/80 mb-2 tracking-wide">
                {slides[currentSlide].subtitle}
              </h2>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-4 lg:mb-6 leading-tight text-balance">
                {slides[currentSlide].title}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 lg:mb-8 leading-relaxed text-pretty max-w-2xl">
                {slides[currentSlide].description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-white/90 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg glow-blue"
              >
                {slides[currentSlide].cta}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-transparent"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-white/20">
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  50K+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-white/70">
                  Active Traders
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  ₹100Cr+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-white/70">
                  Assets Managed
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  99.9%
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-white/70">
                  Uptime
                </div>
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden glass-effect p-2 sm:p-3 lg:p-4">
              <img
                src={slides[currentSlide].image || "/placeholder.svg"}
                alt={slides[currentSlide].title}
                className="w-full h-auto rounded-lg shadow-2xl object-cover aspect-[4/3] lg:aspect-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
