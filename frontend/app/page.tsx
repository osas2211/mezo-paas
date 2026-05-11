import LandingHeader from "@/components/landing/landing-header";
import HeroSection from "@/components/landing/hero-section";
import ObservableSection from "@/components/landing/observable-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import FeaturesSection from "@/components/landing/features-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black font-sans">
      <LandingHeader />
      <HeroSection />
      <ObservableSection />
      <TestimonialsSection />
      <FeaturesSection />
    </div>
  );
}
