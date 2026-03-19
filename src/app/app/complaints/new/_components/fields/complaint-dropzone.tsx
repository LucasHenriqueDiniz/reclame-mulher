"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ComplaintDropzoneFile {
  file: File;
  preview?: string;
}

export interface ComplaintDropzoneProps {
  files: ComplaintDropzoneFile[];
  onFilesChange: (files: ComplaintDropzoneFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  disabled?: boolean;
}

/**
 * Dropzone padronizado para upload de arquivos
 * Segue design do Figma com borda tracejada, ícone e textos centralizados
 */
export function ComplaintDropzone({
  files,
  onFilesChange,
  maxFiles = 3,
  maxSizeMB = 5,
  acceptedFormats = ["PNG", "JPG", "PDF"],
  disabled,
}: ComplaintDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles: ComplaintDropzoneFile[] = droppedFiles
        .slice(0, maxFiles - files.length)
        .map((file) => ({ file }));

      onFilesChange([...files, ...newFiles]);
    },
    [disabled, files, maxFiles, onFilesChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || !e.target.files) return;

      const selectedFiles = Array.from(e.target.files);
      const newFiles: ComplaintDropzoneFile[] = selectedFiles
        .slice(0, maxFiles - files.length)
        .map((file) => ({ file }));

      onFilesChange([...files, ...newFiles]);
    },
    [disabled, files, maxFiles, onFilesChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      onFilesChange(newFiles);
    },
    [files, onFilesChange]
  );

  return (
    <div className="w-full space-y-4">
      {/* Dropzone area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          relative w-full min-h-[180px] rounded-xl
          border-2 border-dashed border-[#1E88E5]
          bg-white
          flex flex-col items-center justify-center gap-3 p-6
          transition-colors
          ${isDragging ? "bg-blue-50 border-[#1976D2]" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <input
          type="file"
          multiple
          accept={acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(",")}
          onChange={handleFileSelect}
          disabled={disabled || files.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Upload icon */}
        <div className="w-12 h-12 rounded-full bg-[#E3F2FD] flex items-center justify-center">
          <Upload className="w-6 h-6 text-[#1E88E5]" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <p className="font-['Poppins'] font-semibold text-[#1E88E5] text-sm">
            Arraste e solte os arquivos
          </p>
          <p className="font-['Poppins'] text-[#607D8B] text-xs">ou</p>
          <Button
            type="button"
            className="bg-[#1E88E5] hover:bg-[#1976D2] text-white px-5 py-1.5 h-auto rounded-lg font-['Poppins'] font-medium text-sm"
            disabled={disabled || files.length >= maxFiles}
          >
            Selecione do computador
          </Button>
        </div>

        {/* Format info */}
        <p className="font-['Poppins'] text-[#607D8B] text-xs text-center">
          {acceptedFormats.join(", ")} até {maxSizeMB}MB
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-[#E5E5ED] bg-white"
            >
              <div className="flex items-center gap-3">
                <FileIcon className="w-5 h-5 text-[#607D8B]" />
                <div>
                  <p className="font-['Poppins'] font-medium text-[#2A3F54] text-sm">
                    {fileItem.file.name}
                  </p>
                  <p className="font-['Poppins'] text-[#607D8B] text-xs">
                    {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Info alert */}
      <div className="bg-[#E3F2FD] border border-[#1E88E5]/20 rounded-lg p-3">
        <p className="font-['Poppins'] text-[#1E88E5] text-xs text-center leading-relaxed">
          Você pode enviar até {maxFiles} arquivos ({acceptedFormats.join(", ")}) com tamanho máximo de {maxSizeMB}MB cada.
        </p>
      </div>
    </div>
  );
}
