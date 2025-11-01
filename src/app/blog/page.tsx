"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/blog/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="font-heading text-4xl mb-6">Blog</h1>

      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Buscar posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-md"
        />
        <Button onClick={handleSearch}>Buscar</Button>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          [API: GET /api/blog/posts?page=1&limit=20]
        </p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded">
              <Link href={`/blog/post-${i}`} className="hover:underline">
                <h2 className="font-heading text-xl mb-2">Post {i}</h2>
              </Link>
              <p className="text-sm text-gray-600">
                Resumo do post {i}...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

