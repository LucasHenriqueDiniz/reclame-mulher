"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ANEXO_EXTENSOES,
  ANEXO_MAX_ARQUIVOS,
  ANEXO_MAX_MB,
  MENSAGEM_LIMITE_DE_ARQUIVOS,
  validarAnexo,
} from "@/lib/constants/anexos";

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
  disabled?: boolean;
};

/**
 * O limite não é configurável por quem usa este componente, e é de propósito:
 * era exatamente assim que a tela e a rota do UploadThing acabaram com números
 * diferentes (task `62`). Quem precisar mudar o limite muda
 * `@/lib/constants/anexos`, e os dois lados mudam juntos.
 */
export function UploadDropzone({
  value,
  onChange,
  onUpload,
  disabled,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setError(null);

      const next = [...value];
      let recusa: string | null = null;
      let excedentes = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Antes era o `for` que parava no limite, e os arquivos de sobra
        // sumiam sem aviso nenhum. Agora eles são contados para virar mensagem.
        if (next.length >= ANEXO_MAX_ARQUIVOS) {
          excedentes++;
          continue;
        }

        const problema = validarAnexo(file);
        if (problema) {
          recusa = recusa ?? problema;
          continue;
        }

        if (onUpload) {
          setUploading(true);
          try {
            next.push(await onUpload(file));
          } catch (e) {
            recusa = recusa ?? (e instanceof Error ? e.message : "Falha ao enviar arquivo.");
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

      if (recusa) {
        setError(recusa);
      } else if (excedentes > 0) {
        setError(MENSAGEM_LIMITE_DE_ARQUIVOS);
      }

      onChange(next);
    },
    [value, onUpload, onChange]
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
          if (!disabled) addFiles(e.dataTransfer.files);
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
          accept={ANEXO_EXTENSOES}
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
          PNG, JPG, JPEG ou PDF. Até {ANEXO_MAX_ARQUIVOS} arquivos, máximo {ANEXO_MAX_MB} MB cada.
        </p>
        {uploading && (
          <p className="mt-2 text-sm text-muted-foreground">Enviando...</p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">{error}</p>
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
