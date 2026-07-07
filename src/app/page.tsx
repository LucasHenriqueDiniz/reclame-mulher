import dynamic from "next/dynamic";
import { MainHeader } from "@/components/layout/MainHeader";
import { Hero } from "@/components/landing/Hero";
import { ImpactStats } from "@/components/landing/ImpactStats";
import { Wave } from "@/components/landing/Wave";

const ProcessCarousel = dynamic(() => import("@/components/landing/ProcessCarousel").then((m) => m.ProcessCarousel));
const ImpactCategories = dynamic(() => import("@/components/landing/ImpactCategories").then((m) => m.ImpactCategories));
const PartnersSection = dynamic(() => import("@/components/landing/PartnersSection").then((m) => m.PartnersSection));
const BlogCards = dynamic(() => import("@/components/landing/BlogCards").then((m) => m.BlogCards));
const Footer = dynamic(() => import("@/components/landing/Footer").then((m) => m.Footer));

export default function HomePage() {
  return (
    <main id="main-content" className="overflow-hidden">
      <MainHeader />
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
