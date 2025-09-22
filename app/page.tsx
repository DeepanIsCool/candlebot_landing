import { Navbar } from "@/components/layout/navbar";
import { CalculatorSection } from "@/components/sections/calculator-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { FooterSection } from "@/components/sections/footer-section";
import { HeroBanner } from "@/components/sections/hero-banner";
import { StockSection } from "@/components/sections/stock-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { IntersectionObserver } from "@/components/ui/intersection-observer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <Navbar />

      <main>
        <section id="home">
          <HeroBanner />
        </section>

        <IntersectionObserver>
          <section id="stock">
            <StockSection />
          </section>
        </IntersectionObserver>

        <IntersectionObserver>
          <section id="calculator">
            <CalculatorSection />
          </section>
        </IntersectionObserver>

        <IntersectionObserver>
          <section id="features">
            <FeaturesSection />
          </section>
        </IntersectionObserver>

        <IntersectionObserver>
          <section id="about">
            <TestimonialsSection />
          </section>
        </IntersectionObserver>
      </main>

      <FooterSection />
    </div>
  );
}
