"use client";

import { Eye } from "lucide-react";

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
 * Passo 3: Quer enviar uma foto ou documento?
 * Totalmente opcional - o usuário pode pular
 */
export function StepThree({ data, onChange, onUpload }: StepThreeProps) {
  return (
    <div className="space-y-6">
      {/* Heading simples */}
      <div className="flex flex-col items-center justify-center gap-2 px-2 py-0">
        <h2 className="text-center font-['Poppins'] font-semibold text-[#2A3F54] text-2xl leading-tight">
          Quer enviar uma foto?
        </h2>
        <p className="text-center font-['Poppins'] text-[#546E7A] text-sm leading-normal">
          Isso é opcional. Você pode enviar fotos, vídeos ou documentos que ajudem a explicar o problema.
        </p>
      </div>

      {/* Aviso de visibilidade.
          Medido na task 16: o anexo segue a visibilidade do relato. Num relato
          público, a lista de anexos é servida para qualquer pessoa logada que
          abra a página. A autora precisa saber disso ANTES de enviar, não
          depois. */}
      <div className="flex gap-3 rounded-xl border-l-4 border-[#1565C0] bg-[#E3F2FD] p-4">
        <Eye className="mt-0.5 h-5 w-5 shrink-0 text-[#1565C0]" aria-hidden="true" />
        <p className="font-['Poppins'] text-sm leading-normal text-[#0D47A1]">
          Quem puder ver este relato também poderá abrir o que você anexar. Se
          você marcar o relato como público na próxima etapa, isso inclui
          qualquer pessoa cadastrada na plataforma. Anexe só o que puder ser
          visto por elas.
        </p>
      </div>

      {/* Dropzone */}
      <UploadDropzone
        value={data.attachments}
        onChange={(attachments) => onChange({ attachments })}
        onUpload={onUpload}
      />
    </div>
  );
}
