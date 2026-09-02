"use client";

import { UploadDropzone, type AttachmentMeta } from "../upload-dropzone";

export interface StepThreeData {
  attachments: AttachmentMeta[];
}

export interface StepThreeProps {
  data: StepThreeData;
  onChange: (data: StepThreeData) => void;
  onUpload?: (file: File) => Promise<{
    file_path: string;
    file_name: string;
    content_type?: string;
    size_bytes?: number;
  }>;
}

/**
 * Step 3: attach a photo or a document.
 * Entirely optional — the user can skip it.
 */
export function StepThree({ data, onChange, onUpload }: StepThreeProps) {
  return (
    <div className="space-y-6">
      {/* Plain heading */}
      <div className="flex flex-col items-center justify-center gap-2 px-2 py-0">
        <h2 className="text-center font-['Poppins'] font-semibold text-[#2A3F54] text-2xl leading-tight">
          Quer enviar uma foto?
        </h2>
        <p className="text-center font-['Poppins'] text-[#607D8B] text-sm leading-normal">
          Isso é opcional. Você pode enviar fotos, vídeos ou documentos que ajudem a explicar o problema.
        </p>
      </div>

      {/* Dropzone */}
      <UploadDropzone
        value={data.attachments}
        onChange={(attachments) => onChange({ attachments })}
        onUpload={onUpload}
        maxFiles={3}
        maxBytesPerFile={5 * 1024 * 1024}
      />
    </div>
  );
}
