"use client";

import { create } from "zustand";
import type { NewsArticle } from "@/types";
import { fetchNewsArticles } from "@/services/news-service";

interface NewsState {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set) => ({
  articles: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const articles = await fetchNewsArticles();
      set({ articles, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },
}));
