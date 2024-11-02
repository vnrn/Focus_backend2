import {
  boolean,
  integer,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import FOCUS from "../../schema";
import { sql } from "drizzle-orm";
import usersTable, { providerEnum } from "./user";

export const genders = FOCUS.enum("genders", [
  "male",
  "female",
  "prefer not to say"
]);

export const profilesTable = FOCUS.table("profile", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  userId: uuid()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  bio: varchar("bio", { length: 255 }),
  wishes: integer("wishes").default(0),
  avatarId: text("avatar_id"),
  prefferredAvatar: providerEnum("prefferred_avatar")
    .default("local")
    .notNull(),
  profileViews: integer("profile_views").default(0),
  isPrivate: boolean("is_private").default(true),
  gender: genders("gender").default("prefer not to say").notNull(),
  displaySubjects: boolean("display_subjects").default(true),
  displaySubjectsNotes: boolean("display_subjects_notes").default(true),
  displaySubjectsTodos: boolean("display_subjects_todos").default(true),
  displaySubjectsAnalytics: boolean("display_subjects_analytics").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  )
});

export default profilesTable;
