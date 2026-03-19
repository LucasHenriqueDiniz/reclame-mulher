import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Arquivo excede o limite de 5 MB" },
        { status: 400 }
      );
    }

    const type = (file.type || "").toLowerCase();
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Formato não permitido. Use PNG, JPG, JPEG ou PDF." },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || (type.includes("pdf") ? ".pdf" : ".bin");
    const baseName = path.basename(file.name, path.extname(file.name)).slice(0, 50);
    const fileName = `${baseName}-${randomUUID().slice(0, 8)}${ext}`;

    // Em produção (ex.: Vercel) use Vercel Blob ou S3; aqui salvamos em disco para dev.
    const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads", "complaints");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Retornamos path relativo para armazenar no banco (ex: complaints/nome-uuid.pdf)
    const relativePath = `complaints/${fileName}`;

    return NextResponse.json({
      file_path: relativePath,
      file_name: file.name,
      content_type: type,
      size_bytes: file.size,
    });
  } catch (error) {
    console.error("Complaint upload error:", error);
    return NextResponse.json(
      { error: "Erro ao enviar arquivo" },
      { status: 500 }
    );
  }
}
