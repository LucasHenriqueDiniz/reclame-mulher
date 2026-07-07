"use client";

import { UploadDropzone, type AttachmentMeta } from "./upload-dropzone";

export type StepThreeData = {
  attachments: AttachmentMeta[];
};

type Props = {
  value: StepThreeData;
  onChange: (data: StepThreeData) => void;
  onUpload?: (file: File) => Promise<{
    file_path: string;
    file_name: string;
    content_type?: string;
    size_bytes?: number;
  }>;
};

export function ComplaintStepThreeAttachments({
  value,
  onChange,
  onUpload,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Anexar arquivos?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deseja anexar um arquivo ao seu relato?
        </p>
      </div>

      <UploadDropzone
        value={value.attachments}
        onChange={(attachments) => onChange({ ...value, attachments })}
        onUpload={onUpload}
        maxFiles={3}
        maxBytesPerFile={5 * 1024 * 1024}
      />

      <p className="text-sm text-muted-foreground">
        Anexos ajudam a empresa a entender melhor o problema. Formatos aceitos: PNG, JPG, JPEG, PDF. Até 3 arquivos.
      </p>
    </div>
  );
}
