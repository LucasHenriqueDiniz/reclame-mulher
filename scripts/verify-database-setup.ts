#!/usr/bin/env tsx
/**
 * Checks that every function, trigger and policy was created.
 */

import { config } from "dotenv";
import postgres from "postgres";
import * as path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!DATABASE_URL) {
  console.error("❌ Erro: DATABASE_URL ou DIRECT_URL deve estar definido no .env");
  process.exit(1);
}

const client = postgres(DATABASE_URL, {
  max: 1,
  ssl: "require",
  prepare: false,
});

type RoutineRow = {
  routine_name: string;
  routine_type: string;
  security_type: string;
};

type TriggerRow = {
  trigger_name: string;
  event_object_table: string;
  event_manipulation: string;
};

type PolicyRow = {
  tablename: string;
  policyname: string;
  cmd: string;
};

type EnumRow = {
  enum_name: string;
  enum_values: string[];
};

type IndexRow = {
  tablename: string;
  indexname: string;
};

async function verifySetup() {
  console.log("🔍 Verificando configuração do banco...\n");

  try {
    // Functions
    console.log("📋 Functions:");
    const functions = await client<RoutineRow[]>`
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
    functions.forEach((f) => {
      console.log(`  ✅ ${f.routine_name} (${f.routine_type}, ${f.security_type})`);
    });

    // Triggers in public
    console.log("\n📋 Triggers (public schema):");
    const triggers = await client<TriggerRow[]>`
      SELECT 
        trigger_name,
        event_object_table,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name;
    `;
    triggers.forEach((t) => {
      console.log(`  ✅ ${t.trigger_name} on ${t.event_object_table} (${t.event_manipulation})`);
    });

    // Trigger on auth.users
    console.log("\n📋 Triggers (auth schema):");
    const authTriggers = await client<TriggerRow[]>`
      SELECT 
        trigger_name,
        event_object_table,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'auth'
      AND event_object_table = 'users';
    `;
    if (authTriggers.length > 0) {
      authTriggers.forEach((t) => {
        console.log(`  ✅ ${t.trigger_name} on ${t.event_object_table} (${t.event_manipulation})`);
      });
    } else {
      console.log("  ⚠️  Nenhum trigger encontrado em auth.users");
      console.log("  ℹ️  Isso pode ser normal se você ainda não tem acesso ao schema auth");
    }

    // RLS policies
    console.log("\n📋 RLS Policies:");
    const policies = await client<PolicyRow[]>`
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
    const tables = new Set(policies.map((p) => p.tablename));
    tables.forEach((table) => {
      const tablePolicies = policies.filter((p) => p.tablename === table);
      console.log(`  📊 ${table} (${tablePolicies.length} policies)`);
      tablePolicies.forEach((p) => {
        console.log(`    ✅ ${p.policyname} (${p.cmd})`);
      });
    });

    // Enums
    console.log("\n📋 Enums:");
    const enums = await client<EnumRow[]>`
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname IN ('app_role', 'complaint_status', 'project_status', 'sender_type')
      GROUP BY t.typname
      ORDER BY t.typname;
    `;
    enums.forEach((e) => {
      console.log(`  ✅ ${e.enum_name}: [${e.enum_values.join(", ")}]`);
    });

    // Indexes
    console.log("\n📋 Índices principais:");
    const indexes = await client<IndexRow[]>`
      SELECT 
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
      LIMIT 20;
    `;
    indexes.forEach((idx) => {
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
