import { BlogRepo } from "@/server/repos/blog";

/**
 * Posts do blog já prontos para o navegador.
 *
 * As duas telas públicas do blog (`/blog` e `/blog/all`) buscavam no cliente e,
 * enquanto esperavam, trocavam a página inteira por um esqueleto — desmontando
 * cabeçalho e rodapé junto. Carregar aqui, no servidor, elimina a troca: a
 * página chega pronta, numa árvore só. Ver `.claude/fixes/tasks/60-*`.
 */
export interface PostDoBlog {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  tags: Array<{ id: string; name: string; slug: string }>;
}

export interface TagDoBlog {
  id: string;
  name: string;
  slug: string;
}

/**
 * Mesma combinação que `GET /api/blog/posts` faz: os posts publicados mais as
 * tags de cada um, numa consulta em lote. Datas viram texto porque atravessam
 * a fronteira servidor → cliente.
 */
export async function listarPostsPublicados(limite: number): Promise<PostDoBlog[]> {
  try {
    const { posts } = await BlogRepo.findPublic(undefined, 1, limite);
    const tagsPorPost = await BlogRepo.getPostTagsBatch(posts.map((post) => post.id));

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      coverUrl: post.coverUrl,
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      tags: (tagsPorPost.get(post.id) ?? []).map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })),
    }));
  } catch (causa) {
    // Mesma degradação de antes: a tela dizia "nenhum post disponível" em vez
    // de quebrar. O que muda é que o erro agora aparece no log do servidor.
    console.error("[blog/listarPostsPublicados]", causa);
    return [];
  }
}

export async function listarTags(): Promise<TagDoBlog[]> {
  try {
    const tags = await BlogRepo.getAllTags();
    return tags.map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug }));
  } catch (causa) {
    console.error("[blog/listarTags]", causa);
    return [];
  }
}
