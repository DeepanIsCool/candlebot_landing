"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Senior Portfolio Manager",
    company: "Axis Mutual Fund",
    image: "/professional-indian-man-suit.png",
    rating: 5,
    shortReview:
      "CandleBot has revolutionized how I manage my clients' portfolios. The analytics are incredible.",
    fullReview:
      "I've been using CandleBot for over 2 years now, and it has completely transformed my investment approach. The real-time analytics, comprehensive calculators, and intuitive interface make it incredibly easy to make informed decisions. The AI-powered insights have helped me identify opportunities I would have missed otherwise. My clients have seen an average 23% improvement in their portfolio performance since I started using this platform. The customer support is exceptional - they're always available when I need help. I can't imagine managing investments without CandleBot now.",
    achievement: "Increased client portfolio performance by 23%",
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Independent Trader",
    company: "Self-Employed",
    image: "/professional-indian-woman-trader.jpg",
    rating: 5,
    shortReview:
      "The calculators saved me hours of manual work. My SIP planning is now completely automated.",
    fullReview:
      "As an independent trader, I need tools that are both powerful and easy to use. CandleBot delivers on both fronts. The SIP calculator alone has saved me countless hours of manual calculations, and the accuracy is spot-on. The tax planning features have helped me optimize my investments for better after-tax returns. What I love most is the clean, intuitive interface - I can focus on trading instead of fighting with complicated software. The mobile app is fantastic too, allowing me to monitor my investments on the go. The community features have connected me with other traders, and I've learned so much from their shared insights.",
    achievement: "Automated 90% of investment calculations",
  },
  {
    id: 3,
    name: "Amit Patel",
    role: "Financial Advisor",
    company: "HDFC Securities",
    image: "/professional-indian-financial-advisor.jpg",
    rating: 5,
    shortReview:
      "Best platform for client presentations. The visual charts make complex data easy to understand.",
    fullReview:
      "CandleBot has become an essential tool in my daily work as a financial advisor. The platform's ability to generate clear, professional charts and reports has made my client presentations much more effective. Clients can easily understand their investment performance and future projections through the intuitive visualizations. The comprehensive calculator suite allows me to run multiple scenarios during client meetings, helping them make informed decisions on the spot. The security features give both me and my clients peace of mind. The platform's reliability is outstanding - I've never experienced any downtime during critical trading hours. It's definitely worth the investment.",
    achievement: "Improved client satisfaction by 40%",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    role: "Wealth Manager",
    company: "Kotak Wealth Management",
    image: "/professional-indian-woman-wealth-manager.jpg",
    rating: 5,
    shortReview:
      "The multi-market access feature is a game-changer. I can manage global portfolios seamlessly.",
    fullReview:
      "Managing high-net-worth clients requires sophisticated tools, and CandleBot exceeds all expectations. The multi-market access feature allows me to manage both domestic and international investments from a single platform, which has streamlined my workflow significantly. The advanced analytics help me identify market trends and opportunities across different asset classes. The risk management tools are particularly impressive - they've helped me protect client portfolios during volatile market conditions. The platform's speed and reliability are crucial when dealing with large transactions. My clients appreciate the detailed reports and transparent fee structure. CandleBot has definitely elevated the quality of service I can provide.",
    achievement: "Manages ₹500+ crores in client assets",
  },
  {
    id: 5,
    name: "Vikram Singh",
    role: "Day Trader",
    company: "Independent",
    image: "/professional-indian-day-trader.jpg",
    rating: 5,
    shortReview:
      "Lightning-fast execution and real-time data. Perfect for day trading strategies.",
    fullReview:
      "Speed is everything in day trading, and CandleBot delivers exceptional performance. The sub-millisecond execution times have given me a significant edge in the market. The real-time data streaming is incredibly reliable - I've never experienced delays or data discrepancies. The advanced charting tools with technical indicators are comprehensive and customizable to my trading style. The mobile app is equally powerful, allowing me to trade effectively even when I'm away from my desk. The platform's stability during high-volume trading sessions is remarkable. The customer support team understands the urgency of trading issues and responds immediately. CandleBot has definitely improved my trading profitability.",
    achievement: "Achieved 85% win rate in day trading",
  },
  {
    id: 6,
    name: "Meera Joshi",
    role: "Investment Analyst",
    company: "SBI Mutual Fund",
    image: "/professional-indian-woman-investment-analyst.jpg",
    rating: 5,
    shortReview:
      "The research tools and market insights have enhanced my analysis capabilities significantly.",
    fullReview:
      "As an investment analyst, I need access to comprehensive market data and analytical tools. CandleBot provides everything I need and more. The research capabilities are outstanding - I can analyze market trends, compare securities, and generate detailed reports efficiently. The AI-powered insights often highlight patterns I might have missed in my manual analysis. The historical data access is extensive, allowing me to conduct thorough backtesting of investment strategies. The collaboration features enable seamless sharing of research with my team. The platform's integration with various data sources saves me significant time in data collection. CandleBot has become an indispensable part of my analytical toolkit.",
    achievement: "Reduced research time by 60%",
  },
];

export function TestimonialsSection() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<
    (typeof testimonials)[0] | null
  >(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonialsPerPage = 3;

  const nextTestimonials = () => {
    setCurrentIndex(
      (prev) => (prev + testimonialsPerPage) % testimonials.length
    );
  };

  const prevTestimonials = () => {
    setCurrentIndex(
      (prev) =>
        (prev - testimonialsPerPage + testimonials.length) % testimonials.length
    );
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + testimonialsPerPage
  );

  return (
    <div className="py-20 bg-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of satisfied traders and investors who trust
            CandleBot for their financial success
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 6).map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10"
              onClick={() => setSelectedTestimonial(testimonial)}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <h4 className="text-foreground font-bold text-base truncate">
                      {testimonial.name}
                    </h4>
                    <p className="text-muted-foreground text-sm font-medium truncate">
                      {testimonial.role}
                    </p>
                    <p className="text-muted-foreground/70 text-xs truncate">
                      {testimonial.company}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-500 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Verified
                  </span>
                </div>

                <div className="relative mb-5">
                  <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-primary to-transparent rounded-full"></div>
                  <div className="pl-4">
                    <Quote className="w-5 h-5 text-primary/60 mb-2" />
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {testimonial.shortReview}
                    </p>
                  </div>
                </div>

                <div className="mb-4 p-4 bg-gradient-to-r from-primary/8 to-primary/4 rounded-lg border-l-2 border-primary/30">
                  <p className="text-primary text-sm font-bold">
                    {testimonial.achievement}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-primary hover:text-primary/80 hover:bg-primary/10 font-medium group-hover:bg-primary/10"
                >
                  Read Full Story →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile/Tablet Carousel */}
        <div className="lg:hidden">
          <div className="relative">
            <div className="grid md:grid-cols-2 gap-6">
              {visibleTestimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10"
                  onClick={() => setSelectedTestimonial(testimonial)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="relative">
                        <img
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <h4 className="text-foreground font-bold text-base truncate">
                          {testimonial.name}
                        </h4>
                        <p className="text-muted-foreground text-sm font-medium truncate">
                          {testimonial.role}
                        </p>
                        <p className="text-muted-foreground/70 text-xs truncate">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-5">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-500 fill-current"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        Verified
                      </span>
                    </div>

                    <div className="relative mb-5">
                      <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-primary to-transparent rounded-full"></div>
                      <div className="pl-4">
                        <Quote className="w-5 h-5 text-primary/60 mb-2" />
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {testimonial.shortReview}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-gradient-to-r from-primary/8 to-primary/4 rounded-lg border-l-2 border-primary/30">
                      <p className="text-primary text-sm font-bold">
                        {testimonial.achievement}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full text-primary hover:text-primary/80 hover:bg-primary/10 font-medium"
                    >
                      Read Full Story →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Carousel Controls */}
            <div className="flex justify-center items-center mt-8 space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTestimonials}
                className="text-foreground hover:bg-accent"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <div className="flex space-x-2">
                {Array.from({
                  length: Math.ceil(testimonials.length / testimonialsPerPage),
                }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index * testimonialsPerPage)}
                    title={`Go to testimonials page ${index + 1}`}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      Math.floor(currentIndex / testimonialsPerPage) === index
                        ? "bg-primary scale-125"
                        : "bg-muted-foreground hover:bg-muted-foreground/80"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextTestimonials}
                className="text-foreground hover:bg-accent"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Testimonial Modal */}
        <Dialog
          open={!!selectedTestimonial}
          onOpenChange={() => setSelectedTestimonial(null)}
        >
          <DialogContent className="bg-card border-border max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedTestimonial && (
              <>
                <DialogHeader className="pb-6 border-b border-border">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={selectedTestimonial.image || "/placeholder.svg"}
                        alt={selectedTestimonial.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-foreground text-2xl font-bold mb-1">
                        {selectedTestimonial.name}
                      </DialogTitle>
                      <p className="text-muted-foreground text-base font-medium mb-3">
                        {selectedTestimonial.role}
                      </p>
                      <p className="text-sm text-muted-foreground/80 mb-3">
                        {selectedTestimonial.company}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(selectedTestimonial.rating)].map(
                            (_, i) => (
                              <Star
                                key={i}
                                className="w-5 h-5 text-yellow-500 fill-current"
                              />
                            )
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                          Verified Customer
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="pt-6 space-y-6">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                        Key Achievement
                      </span>
                    </div>
                    <p className="text-foreground font-bold text-lg">
                      {selectedTestimonial.achievement}
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-primary to-primary/20 rounded-full"></div>
                    <div className="pl-6">
                      <div className="flex items-center mb-4">
                        <Quote className="w-6 h-6 text-primary mr-2" />
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Full Review
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed text-base">
                        {selectedTestimonial.fullReview}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
