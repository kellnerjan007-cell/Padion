import { createClient } from "@/lib/supabase/client";
import type { NewsArticle } from "@/types";

const supabase = createClient();

export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from("news_articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    summary: row.summary as string | null,
    url: row.url as string,
    imageUrl: row.image_url as string | null,
    source: row.source as string | null,
    publishedAt: row.published_at as string,
  }));
}
