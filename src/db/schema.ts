import {
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

export const reportType = pgEnum("report_type", [
  "BUG",
  "FEATURE_REQUEST",
  "FEEDBACK",
  "ABUSE",
  "OTHER",
]);

export const reportStatus = pgEnum("report_status", [
  "PENDING",
  "REVIEWING",
  "RESOLVED",
  "REJECTED",
]);

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

export const howHeardType = pgEnum("how_heard_type", [
  "LINKEDIN",
  "INSTAGRAM",
  "FACEBOOK",
  "TWITTER",
  "AMIGOS",
  "GOOGLE",
  "YOUTUBE",
  "EVENTO",
  "OUTRO",
]);

// Tables
export const profiles = pgTable("profiles", {
  userId: uuid("user_id").primaryKey(), // FK auth.users (não modelamos aqui)
  name: text("name"),
  role: appRole("role").notNull().default("USER"),
  cpf: text("cpf").unique(), // CPF único e obrigatório para pessoas (NULL apenas para empresas)
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  howHeard: howHeardType("how_heard"),
  howHeardOther: text("how_heard_other"), // texto livre quando how_heard = 'OUTRO'
  acceptedTermsAt: timestamp("accepted_terms_at", { withTimezone: true }),
  onboardingCompletedAt: timestamp("onboarding_completed_at", {
    withTimezone: true,
  }),
  avatarUrl: text("avatar_url"),
  locale: text("locale"),
  // Campos adicionais para OAuth (Google, etc)
  provider: text("provider"), // 'email', 'google', etc
  providerId: text("provider_id"), // ID do provider (se aplicável)
  email: text("email").unique(), // cache do email (já está em auth.users, mas útil aqui)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  cnpj: text("cnpj").notNull().unique(), // CNPJ obrigatório e único para empresas
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

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => profiles.userId, { onDelete: "restrict" }),
  type: reportType("type").notNull(),
  status: reportStatus("status").notNull().default("PENDING"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Referência opcional - pode ser relacionado a uma reclamação, empresa, etc
  relatedComplaintId: uuid("related_complaint_id").references(() => complaints.id, {
    onDelete: "set null",
  }),
  relatedCompanyId: uuid("related_company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  // Resposta/observações do admin
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedBy: uuid("resolved_by").references(() => profiles.userId, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

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

// Relations removidas - how_heard agora é campo direto em profiles
