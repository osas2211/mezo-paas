import SmoothScroll from "@/components/landing/smooth-scroll";
import GsapHero from "@/components/landing/gsap-hero";
import GsapArchitecture from "@/components/landing/gsap-architecture";
import GsapFeatures from "@/components/landing/gsap-features";
import GsapFooter from "@/components/landing/gsap-footer";
import LandingHeader from "@/components/landing/landing-header";

export default function Home() {
  return (
    <SmoothScroll>
      <div className="flex flex-col min-h-screen bg-black font-sans text-white selection:bg-primary/30 selection:text-white">
        <LandingHeader />
        <main>
          <GsapHero />
          <GsapArchitecture />
          <GsapFeatures />
        </main>
        <GsapFooter />
      </div>
    </SmoothScroll>
  );
}
