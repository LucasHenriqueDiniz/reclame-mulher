"use client";

import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadThing } from "@/lib/uploadthing";

interface UploadResultItem {
  ufsUrl?: string | null;
  url?: string | null;
}

/**
 * The post's cover image: a URL that can be typed or uploaded.
 *
 * It owns its own `uploading` flag and its own `startUpload`, rather than sharing
 * the page's. The editor has a second, unrelated upload — dropping an image into
 * the Markdown body at the cursor — and one shared flag meant either upload put
 * the other's spinner on screen.
 */
export function FeaturedImageField({
  value,
  onChange,
  onError,
}: {
  value: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const { startUpload } = useUploadThing("blogImage");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = (await startUpload([file])) as UploadResultItem[] | undefined;

      if (result && result[0]) {
        onChange(result[0].ufsUrl || result[0].url || "");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      onError("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-[#1E0D62] mb-2">
        Foto de showcase
      </label>
      <div className="space-y-3">
        {value && (
          <div className="border-2 border-[#1E88E5] rounded-xl p-2">
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
        <div className="flex gap-3">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL da imagem"
            className="flex-1"
          />
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button type="button" variant="outline" disabled={uploading} asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Enviando..." : "Upload"}
              </span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}
