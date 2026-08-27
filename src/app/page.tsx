import dynamic from "next/dynamic";
import { MainHeader } from "@/components/layout/MainHeader";
import { Hero } from "@/components/landing/Hero";
import { ImpactStats } from "@/components/landing/ImpactStats";
import { Wave } from "@/components/landing/Wave";
import { ComplaintsRepo } from "@/server/repos/complaints";

const ProcessCarousel = dynamic(() => import("@/components/landing/ProcessCarousel").then((m) => m.ProcessCarousel));
const ImpactCategories = dynamic(() => import("@/components/landing/ImpactCategories").then((m) => m.ImpactCategories));
const PartnersSection = dynamic(() => import("@/components/landing/PartnersSection").then((m) => m.PartnersSection));
const BlogCards = dynamic(() => import("@/components/landing/BlogCards").then((m) => m.BlogCards));
const Footer = dynamic(() => import("@/components/landing/Footer").then((m) => m.Footer));

/**
 * A home é reconstruída a cada cinco minutos.
 *
 * Sem isto a rota sai **estática** do `next build` e a consulta de
 * `getPlatformStats` roda uma vez só, no build: a seção "Nosso impacto em
 * números" mostrava o que era verdade no dia do deploy e não mudava mais, por
 * mais relatos que chegassem. Medido na task `23` e corrigido na `64`.
 *
 * Por que revalidação por tempo e não `force-dynamic`: a home é a página mais
 * visitada, e a latência até o Neon medida na task `19` é de 139 ms — pagar
 * isso em toda visita para adiantar um número que ninguém confere ao segundo
 * seria caro. Cinco minutos é o intervalo; mudar é uma linha.
 *
 * `revalidatePath("/")` nas rotas que mexem em relato foi considerado e
 * descartado: o `db:seed:demo` escreve direto no banco, sem passar por rota
 * nenhuma, e é justamente o caso em que a home precisa acompanhar.
 */
export const revalidate = 300;

export default async function HomePage() {
  const stats = await ComplaintsRepo.getPlatformStats();

  return (
    // Sem `overflow-hidden`: ele escondia o estouro do rodapé em vez de
    // corrigi-lo, e por isso a home passava no teste enquanto todas as outras
    // páginas com o mesmo rodapé falhavam. Se algo voltar a estourar aqui,
    // é para aparecer.
    <main id="main-content">
      <MainHeader />
      <Hero />
      <ImpactStats {...stats} />
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
