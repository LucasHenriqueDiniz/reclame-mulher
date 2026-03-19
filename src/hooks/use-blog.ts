import { useEffect, useState } from "react";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  contentMd: string | null;
  content: string | null;
  excerpt: string | null;
  coverUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  tags?: Array<{ id: string; name: string; slug: string }>;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
}

interface ApiErrorResponse {
  error?: string;
}

interface BlogPostInput {
  title: string;
  content: string;
  slug: string;
  content_md: string;
  excerpt?: string;
  cover_url?: string;
  status?: "DRAFT" | "PUBLISHED";
  published_at?: Date;
  tag_names?: string[];
}

type BlogPostUpdateInput = Partial<BlogPostInput>;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function parseApiError(response: Response, fallback: string) {
  const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
  return error?.error || fallback;
}

export function useBlogPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.limit) queryParams.set("limit", params.limit.toString());
        if (params?.search) queryParams.set("search", params.search);
        if (params?.tag) queryParams.set("tag", params.tag);

        const response = await fetch(`/api/blog/posts?${queryParams}`);

        if (!response.ok) {
          throw new Error(await parseApiError(response, "Failed to fetch posts"));
        }

        const data = (await response.json()) as BlogPostsResponse;
        setPosts(data.posts);
        setTotal(data.total);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Failed to fetch posts"));
      } finally {
        setLoading(false);
      }
    }

    void fetchPosts();
  }, [params?.page, params?.limit, params?.search, params?.tag]);

  return { posts, total, loading, error };
}

export function useBlogPost(id: string | null) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchPost() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/blog/posts/${id}`);

        if (!response.ok) {
          throw new Error(await parseApiError(response, "Failed to fetch post"));
        }

        const data = (await response.json()) as BlogPost;
        setPost(data);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Failed to fetch post"));
      } finally {
        setLoading(false);
      }
    }

    void fetchPost();
  }, [id]);

  return { post, loading, error };
}

export function useBlogTags(search?: string) {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        setLoading(true);
        setError(null);

        const queryParams = search ? `?search=${encodeURIComponent(search)}` : "";
        const response = await fetch(`/api/blog/tags${queryParams}`);

        if (!response.ok) {
          throw new Error(await parseApiError(response, "Failed to fetch tags"));
        }

        const data = (await response.json()) as BlogTag[];
        setTags(data);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Failed to fetch tags"));
      } finally {
        setLoading(false);
      }
    }

    void fetchTags();
  }, [search]);

  return { tags, loading, error };
}

export async function createBlogPost(data: BlogPostInput) {
  const response = await fetch("/api/blog/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to create post"));
  }

  return (await response.json()) as BlogPost;
}

export async function updateBlogPost(id: string, data: BlogPostUpdateInput) {
  const response = await fetch(`/api/blog/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to update post"));
  }

  return (await response.json()) as BlogPost;
}

export async function deleteBlogPost(id: string) {
  const response = await fetch(`/api/blog/posts/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to delete post"));
  }

  return (await response.json()) as { success?: boolean };
}
