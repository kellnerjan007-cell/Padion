"use client";

import { useEffect } from "react";
import { useNewsStore } from "@/stores/news-store";
import { ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function NewsPage() {
  const { articles, isLoading, error, fetch } = useNewsStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">News</h1>
        <button
          onClick={fetch}
          disabled={isLoading}
          className="p-2 rounded-xl hover:bg-surface transition"
        >
          <RefreshCw className={`w-5 h-5 text-muted ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface rounded-2xl overflow-hidden animate-pulse">
              <div className="h-44 bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && articles.length === 0 && (
        <div className="text-center py-16 text-muted">
          <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Noch keine Artikel vorhanden</p>
          <p className="text-xs mt-1">Artikel können im Supabase Dashboard hinzugefügt werden</p>
        </div>
      )}

      {!isLoading && articles.length > 0 && (
        <div className="space-y-4">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-surface rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition group"
            >
              {/* Image */}
              {article.imageUrl && (
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    sizes="(max-width: 672px) 100vw, 672px"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {article.source && <span className="text-accent font-medium">{article.source}</span>}
                    <span>·</span>
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString("de-CH", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <h2 className="font-semibold text-primary leading-snug mb-1 group-hover:text-accent transition">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-sm text-muted line-clamp-2">{article.summary}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
