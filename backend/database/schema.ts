import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const difficultyEnum = pgEnum("difficulty", [
  "Beginner",
  "Intermediate",
  "Advanced",
]);

export const playlists = pgTable("playlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: difficultyEnum("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  playlistId: uuid("playlist_id").references(() => playlists.id, {
    onDelete: "cascade",
  }),
  slug: text("slug").notNull(), 
  orderIndex: integer("order_index").notNull(),
});
