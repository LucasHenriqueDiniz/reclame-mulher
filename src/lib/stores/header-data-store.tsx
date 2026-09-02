"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TopCompany {
  id: string;
  name: string;
  slug: string;
  sector: string;
  region: string;
  verifiedAt: string;
  stats: {
    resolutionRate: number;
    avgResponseTime: string;
  };
}

interface FeaturedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  category: string;
  readTime: string;
}

interface HeaderDataContextType {
  companies: TopCompany[];
  posts: FeaturedPost[];
  isLoading: boolean;
}

const HeaderDataContext = createContext<HeaderDataContextType>({
  companies: [],
  posts: [],
  isLoading: true,
});

export function HeaderDataProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<TopCompany[]>([]);
  const [posts, setPosts] = useState<FeaturedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // One call per endpoint, no more
    Promise.all([
      fetch("/api/companies/top").then((r) => r.json()),
      fetch("/api/blog/featured").then((r) => r.json()),
    ])
      .then(([companiesData, postsData]) => {
        setCompanies(companiesData);
        setPosts(postsData);
      })
      .catch((error) => {
        console.error("Error loading header data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <HeaderDataContext.Provider value={{ companies, posts, isLoading }}>
      {children}
    </HeaderDataContext.Provider>
  );
}

export function useHeaderData() {
  return useContext(HeaderDataContext);
}
