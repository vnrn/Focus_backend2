import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import userTable from "../personalDetails/user";
import { sql } from "drizzle-orm";
import FOCUS from "../../schema";

export const subjectsTable = FOCUS.table(
  "subjects",
  {
    id: uuid().primaryKey().notNull().unique(),
    userId: uuid()
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    label: varchar("label").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    )
  },
  (table) => {
    return {
      userId_index: index("user_id_index_in_subjects").on(table.userId),
      label_index: index("label_index_in_subjects").on(table.label)
    };
  }
);

export default subjectsTable;
