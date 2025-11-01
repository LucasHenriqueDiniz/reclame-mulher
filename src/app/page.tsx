import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/Hero";
import { ImpactStats } from "@/components/landing/ImpactStats";
import { ProcessCarousel } from "@/components/landing/ProcessCarousel";
import { ImpactCategories } from "@/components/landing/ImpactCategories";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { BlogCards } from "@/components/landing/BlogCards";
import { Footer } from "@/components/landing/Footer";
import { Wave } from "@/components/landing/Wave";

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <Header />
      <Hero />
      <ImpactStats />
      <Wave variant={1}/>
      <ProcessCarousel />
      
      <Wave variant={1} flipped={true} />
      <ImpactCategories />
      <Wave variant={1}  />
      
      <PartnersSection />
      <Wave variant={2}  flipped={true} />
      
      <BlogCards />
      <Footer />
    </main>
  );
}
