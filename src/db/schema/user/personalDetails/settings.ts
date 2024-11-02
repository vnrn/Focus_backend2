import { sql } from "drizzle-orm";
import { boolean, index, timestamp, uuid } from "drizzle-orm/pg-core";
import FOCUS from "../../schema";
import usersTable from "./user";

export const settingsTable = FOCUS.table(
  "settings",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    userId: uuid()
      .unique()
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    pushNotifications: boolean("push_notifications").default(true),
    emailNotifications: boolean("email_notifications").default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    )
  },
  (t) => {
    return {
      userIdIndex: index("user_id_index_on_settings").on(t.userId)
    };
  }
);

export default settingsTable;
