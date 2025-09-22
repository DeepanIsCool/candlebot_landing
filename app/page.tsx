import { Navbar } from "@/app/components/layout/navbar";
import { CalculatorSection } from "@/app/components/sections/calculator-section";
import { FeaturesSection } from "@/app/components/sections/features-section";
import { FooterSection } from "@/app/components/sections/footer-section";
import { HeroBanner } from "@/app/components/sections/hero-banner";
import { StockSection } from "@/app/components/sections/stock-section";
import { TestimonialsSection } from "@/app/components/sections/testimonials-section";
import { IntersectionObserver } from "@/app/components/ui/intersection-observer";

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
