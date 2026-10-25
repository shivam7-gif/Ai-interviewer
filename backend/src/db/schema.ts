import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["admin", "interviewer", "viewer"]);

export const assessmentStatusEnum = pgEnum("assessment_status", [
  "draft",
  "active",
  "archived",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "invited",
  "scheduled",
  "live",
  "finished",
  "reviewed",
]);

export const decisionEnum = pgEnum("decision_type", ["advance", "hold", "decline"]);

// ── Tenancy & Core Tables ──────────────────────────────────────────────────────
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: userRoleEnum("role").default("interviewer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("users_workspace_id_idx").on(table.workspaceId)]
);

export const assessments = pgTable(
  "assessments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    role: text("role").notNull(),
    projectSlug: text("project_slug").notNull(),
    durationMinutes: integer("duration_minutes").default(60).notNull(),
    status: assessmentStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("assessments_workspace_id_idx").on(table.workspaceId)]
);

export const candidates = pgTable(
  "candidates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("candidates_workspace_id_idx").on(table.workspaceId)]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assessmentId: uuid("assessment_id")
      .references(() => assessments.id, { onDelete: "cascade" })
      .notNull(),
    candidateId: uuid("candidate_id")
      .references(() => candidates.id, { onDelete: "cascade" })
      .notNull(),
    status: sessionStatusEnum("status").default("invited").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sessions_assessment_id_idx").on(table.assessmentId),
    index("sessions_candidate_id_idx").on(table.candidateId),
    index("sessions_status_scheduled_at_idx").on(table.status, table.scheduledAt),
  ]
);

export const scores = pgTable(
  "scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .references(() => sessions.id, { onDelete: "cascade" })
      .notNull(),
    overall: numeric("overall", { precision: 2, scale: 1 }).notNull(),
    criteria: jsonb("criteria"),
    summary: text("summary"),
    strongest: text("strongest"),
    weakest: text("weakest"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("scores_session_id_idx").on(table.sessionId),
  ]
);

export const decisions = pgTable(
  "decisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .references(() => sessions.id, { onDelete: "cascade" })
      .notNull(),
    reviewerId: uuid("reviewer_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    decision: decisionEnum("decision").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("decisions_session_id_idx").on(table.sessionId),
    uniqueIndex("decisions_session_reviewer_idx").on(table.sessionId, table.reviewerId),
  ]
);

// ── Kept: Conversations & Messages ───────────────────────────────────────────
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    sessionId: uuid("session_id").references(() => sessions.id, { onDelete: "cascade" }),
    title: text("title"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("conversations_workspace_id_idx").on(table.workspaceId)]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    sender: text("sender").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("messages_conversation_id_idx").on(table.conversationId)]
);

// ── Relations ─────────────────────────────────────────────────────────────────
export const workspacesRelations = relations(workspaces, ({ many }) => ({
  users: many(users),
  assessments: many(assessments),
  candidates: many(candidates),
  conversations: many(conversations),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [users.workspaceId],
    references: [workspaces.id],
  }),
  decisions: many(decisions),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [assessments.workspaceId],
    references: [workspaces.id],
  }),
  sessions: many(sessions),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [candidates.workspaceId],
    references: [workspaces.id],
  }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  assessment: one(assessments, {
    fields: [sessions.assessmentId],
    references: [assessments.id],
  }),
  candidate: one(candidates, {
    fields: [sessions.candidateId],
    references: [candidates.id],
  }),
  score: one(scores, {
    fields: [sessions.id],
    references: [scores.sessionId],
  }),
  decision: one(decisions, {
    fields: [sessions.id],
    references: [decisions.sessionId],
  }),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  session: one(sessions, {
    fields: [scores.sessionId],
    references: [sessions.id],
  }),
}));

export const decisionsRelations = relations(decisions, ({ one }) => ({
  session: one(sessions, {
    fields: [decisions.sessionId],
    references: [sessions.id],
  }),
  reviewer: one(users, {
    fields: [decisions.reviewerId],
    references: [users.id],
  }),
}));
