interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // TODO: Buscar post do banco
  // [API: GET /api/blog/posts/[slug]]

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <article>
        <h1 className="font-heading text-4xl mb-4">Post: {slug}</h1>
        <p className="text-gray-600 mb-6">
          [API: GET /api/blog/posts/{slug}]
        </p>
        <div className="prose">
          <p>Conteúdo do post aparecerá aqui...</p>
        </div>
      </article>
    </div>
  );
}

