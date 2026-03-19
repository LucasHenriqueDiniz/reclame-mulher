import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  primaryKey,
  bigint,
  index,
  uniqueIndex,
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

// Auth users table (custom auth, not Supabase)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  metadata: text("metadata"), // JSON: extra data captured at registration
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// Tables
export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  role: appRole("role").notNull().default("USER"),
  cpf: text("cpf").unique(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  howHeard: howHeardType("how_heard"),
  howHeardOther: text("how_heard_other"),
  acceptedTermsAt: timestamp("accepted_terms_at", { withTimezone: true }),
  onboardingCompletedAt: timestamp("onboarding_completed_at", {
    withTimezone: true,
  }),
  avatarUrl: text("avatar_url"),
  locale: text("locale"),
  provider: text("provider"),
  providerId: text("provider_id"),
  email: text("email").unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    cnpj: text("cnpj").unique(),
    corporateName: text("corporate_name"),
    sector: text("sector"),
    description: text("description"),
    website: text("website"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    neighborhood: text("neighborhood"),
    streetNumber: text("street_number"),
    city: text("city"),
    state: text("state"),
    region: text("region"),
    foundationDate: timestamp("foundation_date", { withTimezone: true }),
    contactPhone: text("contact_phone"),
    contactName: text("contact_name"),
    responsibleName: text("responsible_name"),
    responsibleTitle: text("responsible_title"),
    responsibleEmail: text("responsible_email"),
    slug: text("slug"),
    logoUrl: text("logo_url"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    scheduledPermanentDeletionAt: timestamp("scheduled_permanent_deletion_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (t) => ({
    slugUniqueIdx: uniqueIndex("companies_slug_unique").on(t.slug),
    deletedAtIdx: index("companies_deleted_at_idx").on(t.deletedAt),
    verifiedAtIdx: index("companies_verified_at_idx").on(t.verifiedAt),
  })
);

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
    pk: primaryKey({ columns: [t.userId, t.companyId] }),
  })
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    location: text("location"),
    status: projectStatus("status").notNull().default("PLANNING"),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (t) => ({
    companyStatusIdx: index("projects_company_status_idx").on(t.companyId, t.status),
  })
);

export const complaints = pgTable(
  "complaints",
  {
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
    problemLocation: text("problem_location"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }),
    expectedSolution: text("expected_solution"),
    hasPreviousComplaintElsewhere: boolean("has_previous_complaint_elsewhere").default(false),
    previousComplaintChannel: text("previous_complaint_channel"),
    impactCategory: text("impact_category"),
    urgencyLevel: text("urgency_level"),
    impactScope: text("impact_scope"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    isPublic: boolean("is_public").notNull().default(true),
    status: complaintStatus("status").notNull().default("OPEN"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (t) => ({
    companyStatusIdx: index("complaints_company_status_idx").on(t.companyId, t.status),
    authorIdx: index("complaints_author_id_idx").on(t.authorId),
    publicIdx: index("complaints_is_public_idx").on(t.isPublic),
  })
);

export const complaintAttachments = pgTable("complaint_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  complaintId: uuid("complaint_id")
    .notNull()
    .references(() => complaints.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type"),
  sizeBytes: bigint("size_bytes", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const complaintMessages = pgTable(
  "complaint_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    complaintId: uuid("complaint_id")
      .notNull()
      .references(() => complaints.id, { onDelete: "cascade" }),
    senderType: senderType("sender_type").notNull(),
    authorId: uuid("author_id").references(() => profiles.userId, {
      onDelete: "set null",
    }),
    content: text("content").notNull(),
    attachmentPath: text("attachment_path"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    complaintIdIdx: index("complaint_messages_complaint_id_idx").on(t.complaintId),
  })
);

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  contentMd: text("content_md"),
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
  relatedComplaintId: uuid("related_complaint_id").references(() => complaints.id, {
    onDelete: "set null",
  }),
  relatedCompanyId: uuid("related_company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
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
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  companyUsers: many(companyUsers),
  complaints: many(complaints),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  companyUsers: many(companyUsers),
  projects: many(projects),
  complaints: many(complaints),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  profile: one(profiles, {
    fields: [companyUsers.userId],
    references: [profiles.userId],
  }),
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, {
    fields: [projects.companyId],
    references: [companies.id],
  }),
  complaints: many(complaints),
}));

export const complaintAttachmentsRelations = relations(complaintAttachments, ({ one }) => ({
  complaint: one(complaints, {
    fields: [complaintAttachments.complaintId],
    references: [complaints.id],
  }),
}));

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  author: one(profiles, {
    fields: [complaints.authorId],
    references: [profiles.userId],
  }),
  company: one(companies, {
    fields: [complaints.companyId],
    references: [companies.id],
  }),
  project: one(projects, {
    fields: [complaints.projectId],
    references: [projects.id],
  }),
  messages: many(complaintMessages),
  attachments: many(complaintAttachments),
}));

export const complaintMessagesRelations = relations(complaintMessages, ({ one }) => ({
  complaint: one(complaints, {
    fields: [complaintMessages.complaintId],
    references: [complaints.id],
  }),
  author: one(profiles, {
    fields: [complaintMessages.authorId],
    references: [profiles.userId],
  }),
}));

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
