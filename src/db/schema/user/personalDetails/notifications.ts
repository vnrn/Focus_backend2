import { sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
  varchar,
  index
} from "drizzle-orm/pg-core";
import userTable from "./user";
import FOCUS from "../../schema";

export const notificationTypeEnum = FOCUS.enum("notification_type", [
  "new_follow_request",
  "new_follow",
  "new_love",
  "follow_accept",
  "system_update",
  "success",
  "warning",
  "email_verify",
  "trial_expiration"
]);

export const notificationFromEnum = FOCUS.enum("notification_from", [
  "user",
  "system"
]);

export const notificationsTable = FOCUS.table(
  "notifications",
  {
    id: uuid()
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    userId: uuid()
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    type: notificationTypeEnum("notification_type")
      .default("system_update")
      .notNull(),
    hasButton: boolean("has_button").notNull().default(false),
    buttonLabel: varchar("button_label", { length: 255 }),
    buttonLink: text("button_link"),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    from: notificationFromEnum("notification_from").default("system").notNull(),
    fromUserId: uuid().references(() => userTable.id, { onDelete: "cascade" }),
    seenAt: timestamp("seen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => {
    return {
      userId_index: index("user_id_index_in_notifications").on(table.userId)
    };
  }
);

export default notificationsTable;
