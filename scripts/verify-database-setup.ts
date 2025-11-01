#!/usr/bin/env tsx
/**
 * Script para verificar se todas as functions, triggers e policies foram criadas
 */

import { config } from "dotenv";
import postgres from "postgres";
import * as path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Erro: DATABASE_URL deve estar definido no .env");
  process.exit(1);
}

const client = postgres(DATABASE_URL, {
  max: 1,
  ssl: "require",
  prepare: false,
});

async function verifySetup() {
  console.log("🔍 Verificando configuração do banco...\n");

  try {
    // Verificar Functions
    console.log("📋 Functions:");
    const functions = await client`
      SELECT 
        routine_name,
        routine_type,
        security_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name IN (
        'handle_new_user',
        'update_updated_at_column',
        'update_profile_person',
        'create_company_self_json'
      )
      ORDER BY routine_name;
    `;
    functions.forEach((f: any) => {
      console.log(`  ✅ ${f.routine_name} (${f.routine_type}, ${f.security_type})`);
    });

    // Verificar Triggers em public
    console.log("\n📋 Triggers (public schema):");
    const triggers = await client`
      SELECT 
        trigger_name,
        event_object_table,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name;
    `;
    triggers.forEach((t: any) => {
      console.log(`  ✅ ${t.trigger_name} on ${t.event_object_table} (${t.event_manipulation})`);
    });

    // Verificar Trigger em auth.users
    console.log("\n📋 Triggers (auth schema):");
    const authTriggers = await client`
      SELECT 
        trigger_name,
        event_object_table,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'auth'
      AND event_object_table = 'users';
    `;
    if (authTriggers.length > 0) {
      authTriggers.forEach((t: any) => {
        console.log(`  ✅ ${t.trigger_name} on ${t.event_object_table} (${t.event_manipulation})`);
      });
    } else {
      console.log("  ⚠️  Nenhum trigger encontrado em auth.users");
      console.log("  ℹ️  Isso pode ser normal se você ainda não tem acesso ao schema auth");
    }

    // Verificar RLS Policies
    console.log("\n📋 RLS Policies:");
    const policies = await client`
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;
    const tables = new Set(policies.map((p: any) => p.tablename));
    tables.forEach((table) => {
      const tablePolicies = policies.filter((p: any) => p.tablename === table);
      console.log(`  📊 ${table} (${tablePolicies.length} policies)`);
      tablePolicies.forEach((p: any) => {
        console.log(`    ✅ ${p.policyname} (${p.cmd})`);
      });
    });

    // Verificar Enums
    console.log("\n📋 Enums:");
    const enums = await client`
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname IN ('app_role', 'complaint_status', 'project_status', 'sender_type')
      GROUP BY t.typname
      ORDER BY t.typname;
    `;
    enums.forEach((e: any) => {
      console.log(`  ✅ ${e.enum_name}: [${e.enum_values.join(", ")}]`);
    });

    // Verificar Índices
    console.log("\n📋 Índices principais:");
    const indexes = await client`
      SELECT 
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
      LIMIT 20;
    `;
    indexes.forEach((idx: any) => {
      console.log(`  ✅ ${idx.indexname} on ${idx.tablename}`);
    });

    console.log("\n✨ Verificação concluída!");
  } catch (error) {
    console.error("❌ Erro ao verificar:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifySetup();
