"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

/**
 * Owns the draft tag being typed; the committed list stays with the page, which is
 * what the save handler reads.
 */
export function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
}) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
      setNewTag("");
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-[#1E0D62] mb-2">
        Tags
      </label>
      <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 rounded-xl">
        {tags.map((tag) => (
          <Badge
            key={tag}
            className="bg-[#1E88E5] text-white flex items-center gap-2"
          >
            {tag}
            <button
              aria-label={`Remover tag ${tag}`}
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          placeholder="Adicionar tag..."
          className="flex-1 min-w-[150px] border-0 focus-visible:ring-0 p-0 h-auto"
        />
      </div>
    </div>
  );
}
