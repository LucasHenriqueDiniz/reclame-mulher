"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/pdf": [".pdf"],
} as const;

const ACCEPT_STR = ".png,.jpg,.jpeg,.pdf";
const MAX_FILES = 3;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export type AttachmentMeta = {
  file_path: string;
  file_name: string;
  content_type?: string;
  size_bytes?: number;
  file?: File; // kept until uploaded
};

type UploadDropzoneProps = {
  value: AttachmentMeta[];
  onChange: (list: AttachmentMeta[]) => void;
  onUpload?: (file: File) => Promise<{ file_path: string; file_name: string; content_type?: string; size_bytes?: number }>;
  maxFiles?: number;
  maxBytesPerFile?: number;
  disabled?: boolean;
};

export function UploadDropzone({
  value,
  onChange,
  onUpload,
  maxFiles = MAX_FILES,
  maxBytesPerFile = MAX_BYTES,
  disabled,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxBytesPerFile) {
        return `Arquivo muito grande. Máximo ${Math.round(maxBytesPerFile / 1024 / 1024)} MB por arquivo.`;
      }
      const type = file.type?.toLowerCase();
      const allowed = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];
      if (!type || !allowed.includes(type)) {
        return "Formato não permitido. Use PNG, JPG, JPEG ou PDF.";
      }
      return null;
    },
    [maxBytesPerFile]
  );

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setError(null);
      const next = [...value];
      for (let i = 0; i < files.length && next.length < maxFiles; i++) {
        const file = files[i];
        const err = validateFile(file);
        if (err) {
          setError(err);
          continue;
        }
        if (onUpload) {
          setUploading(true);
          try {
            const meta = await onUpload(file);
            next.push(meta);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Falha ao enviar arquivo.");
          } finally {
            setUploading(false);
          }
        } else {
          next.push({
            file_path: "",
            file_name: file.name,
            content_type: file.type,
            size_bytes: file.size,
            file,
          });
        }
      }
      if (next.length > maxFiles) next.length = maxFiles;
      onChange(next);
    },
    [value, maxFiles, validateFile, onUpload, onChange]
  );

  const removeAt = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (!disabled && value.length < maxFiles) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          dragActive ? "border-[var(--brand-blue)] bg-blue-50/50" : "border-muted-foreground/30 bg-muted/30",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STR}
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files ?? null);
            e.target.value = "";
          }}
        />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">
          Arraste arquivos aqui ou{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[var(--brand-blue)] underline hover:no-underline"
          >
            selecione do computador
          </button>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG, JPG, JPEG ou PDF. Até {maxFiles} arquivos, máximo {Math.round(maxBytesPerFile / 1024 / 1024)} MB cada.
        </p>
        {uploading && (
          <p className="mt-2 text-sm text-muted-foreground">Enviando...</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((a, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                {a.file_name}
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Remover anexo"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
