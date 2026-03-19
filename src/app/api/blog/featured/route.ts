import { NextResponse } from "next/server";

// Mock data - posts em destaque do blog
export async function GET() {
  const featuredPosts = [
    {
      id: "1",
      title: "Como fazer uma reclamação efetiva sobre obras de infraestrutura",
      slug: "como-fazer-reclamacao-efetiva",
      excerpt: "Aprenda as melhores práticas para registrar reclamações que realmente geram resultados e melhoram sua comunidade.",
      imageUrl: "/blog-image.webp",
      publishedAt: new Date("2024-03-10").toISOString(),
      author: {
        name: "Maria Silva",
        avatarUrl: "/blog-avatar.webp",
      },
      category: "Guias",
      readTime: "5 min",
    },
    {
      id: "2",
      title: "Direitos da comunidade em projetos de grande porte",
      slug: "direitos-comunidade-projetos",
      excerpt: "Conheça seus direitos quando grandes obras de infraestrutura afetam sua região e como exercê-los.",
      imageUrl: "/blog-image-2.webp",
      publishedAt: new Date("2024-03-08").toISOString(),
      author: {
        name: "João Costa",
        avatarUrl: "/blog-avatar.webp",
      },
      category: "Direitos",
      readTime: "8 min",
    },
    {
      id: "3",
      title: "Casos de sucesso: Comunidades que transformaram suas realidades",
      slug: "casos-sucesso-comunidades",
      excerpt: "Histórias inspiradoras de como a participação ativa da comunidade resultou em melhorias significativas.",
      imageUrl: "/blog-image-3.webp",
      publishedAt: new Date("2024-03-05").toISOString(),
      author: {
        name: "Ana Santos",
        avatarUrl: "/blog-avatar.webp",
      },
      category: "Casos de Sucesso",
      readTime: "6 min",
    },
  ];

  return NextResponse.json(featuredPosts);
}
