"use client";

import { ComplaintDropzone, ComplaintDropzoneFile } from "../fields/complaint-dropzone";

export interface StepThreeData {
  files: ComplaintDropzoneFile[];
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
 * Passo 3: Anexar arquivos
 * Upload de imagens e documentos
 */
export function StepThree({ data, onChange, onUpload }: StepThreeProps) {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col items-center justify-center gap-2 px-2 py-0">
        <h2 className="text-center font-['Poppins'] font-semibold text-[#000000] text-2xl leading-tight">
          Anexar arquivos?
        </h2>
        <p className="text-center font-['Poppins'] font-light text-[#607D8B] text-sm leading-normal">
          Deseja anexar um arquivo a sua reclamação?
        </p>
      </div>

      {/* Dropzone */}
      <ComplaintDropzone
        files={data.files}
        onFilesChange={(files) => onChange({ files })}
        maxFiles={3}
        maxSizeMB={5}
        acceptedFormats={["PNG", "JPG", "PDF"]}
      />
    </div>
  );
}
