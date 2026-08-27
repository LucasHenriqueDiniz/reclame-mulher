import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { BlogContent } from "./_components/blog-content";
import { listarPostsPublicados } from "./_lib/posts";

// Os posts mudam sem novo build. Sem isto o Next congelaria a lista no momento
// da compilação — o mesmo defeito que o achado `64` descreve para a home.
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await listarPostsPublicados(10);

  return (
    <div className="flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-white min-h-screen">
      <MainHeader />
      <BlogContent posts={posts} />
      <div className="py-12"></div>
      <Footer />
    </div>
  );
}
