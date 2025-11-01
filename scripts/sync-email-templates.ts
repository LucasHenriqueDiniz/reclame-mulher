#!/usr/bin/env tsx
/**
 * Script para sincronizar templates de e-mail com Supabase Storage
 * 
 * Uso:
 *   pnpm tsx scripts/sync-email-templates.ts
 * 
 * Requer:
 *   - SUPABASE_SERVICE_ROLE_KEY no .env
 *   - Bucket "email-templates" criado no Supabase Storage
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Carrega variáveis do .env
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = "email-templates";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Erro: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function syncTemplates() {
  const templatesDir = path.join(__dirname, "..", "email-templates");
  
  if (!fs.existsSync(templatesDir)) {
    console.error(`❌ Diretório ${templatesDir} não encontrado`);
    process.exit(1);
  }

  console.log("📦 Verificando bucket...");
  
  // Verifica se o bucket existe
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("❌ Erro ao listar buckets:", listError);
    process.exit(1);
  }

  const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log(`📦 Criando bucket ${BUCKET_NAME}...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 1048576, // 1MB
      allowedMimeTypes: ["text/html", "text/plain"],
    });
    
    if (createError) {
      console.error("❌ Erro ao criar bucket:", createError);
      process.exit(1);
    }
    console.log("✅ Bucket criado com sucesso");
  }

  // Lista arquivos no diretório
  const files = fs.readdirSync(templatesDir).filter(
    (file) => file.endsWith(".html") || file.endsWith(".txt")
  );

  if (files.length === 0) {
    console.log("⚠️  Nenhum template encontrado");
    return;
  }

  console.log(`📤 Sincronizando ${files.length} template(s)...\n`);

  for (const file of files) {
    const filePath = path.join(templatesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    
    console.log(`📄 Uploading ${file}...`);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file, content, {
        contentType: file.endsWith(".html") ? "text/html" : "text/plain",
        upsert: true, // Sobrescreve se existir
      });

    if (error) {
      console.error(`❌ Erro ao fazer upload de ${file}:`, error.message);
    } else {
      console.log(`✅ ${file} sincronizado com sucesso`);
    }
  }

  console.log("\n✨ Sincronização concluída!");
}

syncTemplates().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});
