"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Real-time market data with sophisticated charting tools and technical indicators",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Calculator,
    title: "Smart Calculators",
    description:
      "Comprehensive suite of financial calculators for SIP, FD, tax planning, and more",
    color: "from-purple-500 to-pink-400",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "Enterprise-level security with 256-bit encryption and multi-factor authentication",
    color: "from-green-500 to-emerald-400",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Sub-millisecond execution with 99.9% uptime and real-time data streaming",
    color: "from-yellow-500 to-orange-400",
  },
  {
    icon: TrendingUp,
    title: "AI-Powered Insights",
    description:
      "Machine learning algorithms provide personalized investment recommendations",
    color: "from-indigo-500 to-purple-400",
  },
  {
    icon: Globe,
    title: "Multi-Market Access",
    description:
      "Trade across NSE, BSE, and international markets from a single platform",
    color: "from-teal-500 to-blue-400",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Round-the-clock customer support with dedicated relationship managers",
    color: "from-red-500 to-pink-400",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Join a community of 50,000+ active traders sharing insights and strategies",
    color: "from-cyan-500 to-teal-400",
  },
];

export function FeaturesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuresPerPage = 4;

  const nextFeatures = () => {
    setCurrentIndex((prev) => (prev + featuresPerPage) % features.length);
  };

  const prevFeatures = () => {
    setCurrentIndex(
      (prev) => (prev - featuresPerPage + features.length) % features.length
    );
  };

  const visibleFeatures = features.slice(
    currentIndex,
    currentIndex + featuresPerPage
  );

  return (
    <div className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Why Choose CandleBot?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of trading with our cutting-edge platform
            designed for modern investors
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 group hover:scale-105"
            >
              <CardHeader className="text-center">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-foreground text-xl">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile/Tablet Carousel */}
        <div className="lg:hidden">
          <div className="relative">
            <div className="grid md:grid-cols-2 gap-6">
              {visibleFeatures.map((feature, index) => (
                <Card
                  key={currentIndex + index}
                  className="bg-card border-border hover:border-primary/50 transition-all duration-300"
                >
                  <CardHeader className="text-center">
                    <div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-4`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground text-xl">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Carousel Controls */}
            <div className="flex justify-center items-center mt-8 space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevFeatures}
                className="text-foreground hover:bg-accent"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <div className="flex space-x-2">
                {Array.from({
                  length: Math.ceil(features.length / featuresPerPage),
                }).map((_, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentIndex(index * featuresPerPage)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 p-0 ${
                      Math.floor(currentIndex / featuresPerPage) === index
                        ? "bg-primary scale-125"
                        : "bg-muted-foreground hover:bg-muted-foreground/80"
                    }`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextFeatures}
                className="text-foreground hover:bg-accent"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-blue-600 dark:via-blue-700 dark:to-cyan-600 rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-blue-500/30">
            {/* Overlay for extra contrast in light mode */}
            <div className="absolute inset-0 bg-blue-950/80 dark:bg-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Start Trading?
              </h3>
              <p className="text-slate-200 dark:text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
                Join thousands of successful traders who trust CandleBot for
                their investment journey
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 shadow-lg border-2 border-white"
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-slate-900 bg-transparent transition-all duration-300"
                >
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
