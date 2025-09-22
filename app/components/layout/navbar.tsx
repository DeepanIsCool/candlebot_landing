"use client";

import { cn } from "@/app/components/lib/utils";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { Button } from "@/app/components/ui/button";
import {
  BarChart3,
  Calculator,
  Home,
  Menu,
  Star,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Home", href: "#home", icon: Home, description: "Landing page" },
  {
    name: "Stock",
    href: "#stock",
    icon: BarChart3,
    description: "Market data & analysis",
  },
  {
    name: "Calculator",
    href: "#calculator",
    icon: Calculator,
    description: "Financial calculators",
  },
  {
    name: "Features",
    href: "#features",
    icon: Star,
    description: "Platform features",
  },
  {
    name: "About Us",
    href: "#about",
    icon: Users,
    description: "Our story & team",
  },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      // Determine active section based on scroll position
      const sections = navItems.map((item) => ({
        id: item.href.substring(1),
        element: document.querySelector(item.href),
      }));

      const currentSection = sections.find((section) => {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string, buttonElement?: HTMLButtonElement) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
    // Remove focus to prevent persistent outline
    if (buttonElement) {
      buttonElement.blur();
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-smooth",
        "glass border-b border-border/50 bg-background/95 backdrop-blur-md",
        isScrolled && "shadow-minimal-lg bg-background/98"
      )}
    >
      <div className="max-w-7xl mx-auto compact-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
              <img
                src="/candlebot_logo_ani.gif"
                alt="CandleBot Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight drop-shadow-sm">
                CandleBot
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.href.substring(1);

              return (
                <button
                  key={item.name}
                  onClick={(e) => scrollToSection(item.href, e.currentTarget)}
                  className={cn(
                    "group relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200",
                    "hover:bg-accent/50 focus:outline-none active:scale-95",
                    "backdrop-blur-sm bg-background/80",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "text-foreground/90 hover:text-foreground hover:bg-background/90"
                  )}
                  title={item.description}
                >
                  <Icon className="w-4 h-4 drop-shadow-sm" />
                  <span className="font-medium text-sm drop-shadow-sm">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-10 w-10 p-0 hover:bg-accent/50 rounded-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass-strong border-t border-border/50 mt-2 rounded-b-xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.href.substring(1);

                return (
                  <button
                    key={item.name}
                    onClick={(e) => scrollToSection(item.href, e.currentTarget)}
                    className={cn(
                      "flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all duration-200",
                      "hover:bg-accent/50 focus:outline-none active:scale-95",
                      "backdrop-blur-sm bg-background/80",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "text-foreground/90 hover:text-foreground hover:bg-background/90"
                    )}
                  >
                    <Icon className="w-5 h-5 drop-shadow-sm" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm drop-shadow-sm">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground drop-shadow-sm">
                        {item.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
