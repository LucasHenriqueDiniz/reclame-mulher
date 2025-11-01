import { supabaseServer } from "@/lib/supabase/server";
import { CreatePostInput, UpdatePostInput } from "../dto/blog";

export class BlogRepo {
  static async create(data: CreatePostInput) {
    const supabase = await supabaseServer();

    // Extrair tag_names antes de inserir
    const { tag_names, ...postData } = data;

    const { data: post, error } = await supabase
      .from("blog_posts")
      .insert(postData)
      .select()
      .single();

    if (error) throw error;

    // Vincular tags se fornecidas
    if (tag_names && tag_names.length > 0 && post?.id) {
      await BlogRepo.linkTags(post.id, tag_names);
    }

    return post;
  }

  static async linkTags(postId: string, tagNames: string[]) {
    const supabase = await supabaseServer();

    const { error } = await supabase.rpc("link_post_tags_by_names", {
      p_post_id: postId,
      p_names: tagNames,
    });

    if (error) throw error;
  }

  static async findBySlug(slug: string, includeTags = false) {
    const supabase = await supabaseServer();

    const query = supabase
      .from("blog_posts")
      .select(includeTags ? "*, blog_post_tags(tag:blog_tags(*))" : "*")
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .not("published_at", "is", null)
      .single();

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  static async findPublic(
    search?: string,
    page = 1,
    limit = 10,
    includeTags = false
  ) {
    const supabase = await supabaseServer();

    let query = supabase
      .from("blog_posts")
      .select(
        includeTags ? "*, blog_post_tags(tag:blog_tags(*))" : "*"
      )
      .eq("status", "PUBLISHED")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    );

    if (error) throw error;
    return { posts: data, total: count };
  }

  static async findByTagSlug(tagSlug: string, page = 1, limit = 20) {
    const supabase = await supabaseServer();

    // Buscar tag pelo slug
    const { data: tag, error: tagError } = await supabase
      .from("blog_tags")
      .select("id")
      .eq("slug", tagSlug)
      .single();

    if (tagError || !tag) {
      return { posts: [], total: 0 };
    }

    // Buscar posts vinculados
    const { data: postTags, error: postTagsError } = await supabase
      .from("blog_post_tags")
      .select("post_id")
      .eq("tag_id", tag.id);

    if (postTagsError || !postTags || postTags.length === 0) {
      return { posts: [], total: 0 };
    }

    const postIds = postTags.map((pt) => pt.post_id);

    // Buscar posts
    const { data, error, count } = await supabase
      .from("blog_posts")
      .select("*, blog_post_tags(tag:blog_tags(*))")
      .in("id", postIds)
      .eq("status", "PUBLISHED")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return { posts: data || [], total: count || 0 };
  }

  static async update(id: string, data: UpdatePostInput) {
    const supabase = await supabaseServer();

    // Extrair tag_names antes de atualizar
    const { tag_names, ...postData } = data;

    const { data: post, error } = await supabase
      .from("blog_posts")
      .update(postData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Atualizar tags se fornecidas (undefined significa não alterar, [] significa remover todas)
    if (tag_names !== undefined && post?.id) {
      await BlogRepo.linkTags(post.id, tag_names);
    }

    // Refresh materialized view se mudou status para PUBLISHED
    if (data.status === "PUBLISHED" || post?.status === "PUBLISHED") {
      await supabase.rpc("refresh_tag_counts");
    }

    return post;
  }

  static async delete(id: string) {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async findAll(page = 1, limit = 10, includeTags = false) {
    const supabase = await supabaseServer();

    const { data, error, count } = await supabase
      .from("blog_posts")
      .select(includeTags ? "*, blog_post_tags(tag:blog_tags(*))" : "*")
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return { posts: data, total: count };
  }

  // ====== TAG METHODS ======

  static async getAllTags(publicOnly = false) {
    const supabase = await supabaseServer();

    if (publicOnly) {
      // Usar materialized view para performance
      const { data, error } = await supabase
        .from("mv_tag_counts_public")
        .select("*")
        .order("count", { ascending: false });

      if (error) throw error;
      return data;
    }

    // Para admin/autocomplete: todas as tags
    const { data, error } = await supabase
      .from("blog_tags")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  }

  static async searchTags(query: string, limit = 50) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("blog_tags")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async getPostTags(postId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("blog_post_tags")
      .select("tag:blog_tags(*)")
      .eq("post_id", postId);

    if (error) throw error;
    return data?.map((item: { tag: unknown }) => item.tag) || [];
  }
}
