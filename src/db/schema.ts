import {
  pgSchema,
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const appRole = pgEnum("app_role", ["USER", "COMPANY", "ADMIN"]);

export const complaintStatus = pgEnum("complaint_status", [
  "OPEN",
  "RESPONDED",
  "RESOLVED",
  "CANCELLED",
]);

export const senderType = pgEnum("sender_type", ["USER", "COMPANY", "ADMIN"]);

export const projectStatus = pgEnum("project_status", [
  "PLANNING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const blogPostStatus = pgEnum("blog_post_status", [
  "DRAFT",
  "PUBLISHED",
]);

export const howHeardSourceType = pgEnum("how_heard_source_type", [
  "PREDEFINED",
  "FREE_TEXT",
]);

// Tables
export const profiles = pgTable("profiles", {
  userId: uuid("user_id").primaryKey(), // FK auth.users (não modelamos aqui)
  name: text("name"),
  role: appRole("role").notNull().default("USER"),
  cpf: text("cpf"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  // Removido howHeard - agora em tabela separada
  acceptedTermsAt: timestamp("accepted_terms_at", { withTimezone: true }),
  onboardingCompletedAt: timestamp("onboarding_completed_at", {
    withTimezone: true,
  }),
  avatarUrl: text("avatar_url"),
  locale: text("locale"),
  // Campos adicionais para OAuth (Google, etc)
  provider: text("provider"), // 'email', 'google', etc
  providerId: text("provider_id"), // ID do provider (se aplicável)
  email: text("email"), // cache do email (já está em auth.users, mas útil aqui)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  cnpj: text("cnpj"),
  corporateName: text("corporate_name"),
  sector: text("sector"),
  website: text("website"),
  contactPhone: text("contact_phone"),
  responsibleName: text("responsible_name"),
  responsibleTitle: text("responsible_title"),
  responsibleEmail: text("responsible_email"),
  slug: text("slug"),
  logoUrl: text("logo_url"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const companyUsers = pgTable(
  "company_users",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    role: text("role").default("MEMBER"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: { columns: [t.userId, t.companyId], isPrimaryKey: true },
  })
);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: projectStatus("status").notNull().default("PLANNING"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const complaints = pgTable("complaints", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => profiles.userId, { onDelete: "restrict" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "restrict" }),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }),
  expectedSolution: text("expected_solution"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(false),
  status: complaintStatus("status").notNull().default("OPEN"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const complaintMessages = pgTable("complaint_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  complaintId: uuid("complaint_id")
    .notNull()
    .references(() => complaints.id, { onDelete: "cascade" }),
  senderType: senderType("sender_type").notNull(),
  authorId: uuid("author_id").references(() => profiles.userId, {
    onDelete: "set null",
  }), // pode ser null para mensagens automáticas
  content: text("content").notNull(),
  attachmentPath: text("attachment_path"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"), // pode ser markdown ou HTML
  contentMd: text("content_md"), // se quiser separar markdown
  excerpt: text("excerpt"),
  coverUrl: text("cover_url"),
  status: blogPostStatus("status").notNull().default("DRAFT"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const blogTags = pgTable("blog_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blogPostTags = pgTable(
  "blog_post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => blogTags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  })
);

// Relations
export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  postLinks: many(blogPostTags),
}));

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  tag: one(blogTags, {
    fields: [blogPostTags.tagId],
    references: [blogTags.id],
  }),
  post: one(blogPosts, {
    fields: [blogPostTags.postId],
    references: [blogPosts.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ many }) => ({
  tagLinks: many(blogPostTags),
}));

// ====== HOW HEARD TABLES ======

export const howHeardOptions = pgTable("how_heard_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull().unique(), // "LinkedIn", "Instagram", "Amigos", etc
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userHowHeard = pgTable("user_how_heard", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.userId, { onDelete: "cascade" }),
  sourceType: howHeardSourceType("source_type").notNull().default("FREE_TEXT"),
  optionId: uuid("option_id").references(() => howHeardOptions.id, {
    onDelete: "set null",
  }), // null se for FREE_TEXT
  freeText: text("free_text"), // preenchido se for FREE_TEXT ou complemento
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relations
export const howHeardOptionsRelations = relations(
  howHeardOptions,
  ({ many }) => ({
    userLinks: many(userHowHeard),
  })
);

export const userHowHeardRelations = relations(userHowHeard, ({ one }) => ({
  user: one(profiles, {
    fields: [userHowHeard.userId],
    references: [profiles.userId],
  }),
  option: one(howHeardOptions, {
    fields: [userHowHeard.optionId],
    references: [howHeardOptions.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  howHeardLinks: many(userHowHeard),
}));
