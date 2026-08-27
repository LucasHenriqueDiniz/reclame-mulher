import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { AllPostsContent } from "./_components/all-posts-content";
import { listarPostsPublicados, listarTags } from "../_lib/posts";

// Mesmo motivo de /blog: a lista de posts não pode congelar no build.
export const dynamic = "force-dynamic";

export default async function AllBlogPostsPage() {
  const [posts, tags] = await Promise.all([listarPostsPublicados(100), listarTags()]);

  return (
    <div className="flex flex-col bg-gradient-to-b from-blue-50/30 via-white to-blue-50/20 min-h-screen">
      <MainHeader />
      <AllPostsContent posts={posts} tags={tags} />
      <div className="py-12"></div>
      <Footer />
    </div>
  );
}
