import { HeroSection } from "@/components/sections/hero-section";
import { CategoryShowcase } from "@/components/sections/category-showcase";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { TestimonialsPreview } from "@/components/sections/testimonials-preview";
import { CallToAction } from "@/components/sections/call-to-action";

export default function HomePage() {
  return (
    <div className="min-h-screen md:mt-0 mt-10">
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <WhyChooseUs />
      {/* <TestimonialsPreview /> */}
      <CallToAction />
    </div>
  );
}
