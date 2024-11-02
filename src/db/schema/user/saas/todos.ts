import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { subjectsTable } from "./subjects";
import { sql } from "drizzle-orm";
import FOCUS from "../../schema";

export const subjectsTodosTable = FOCUS.table(
  "subjects_todos",
  {
    id: uuid().primaryKey().notNull().unique(),
    subjectId: uuid()
      .references(() => subjectsTable.id, { onDelete: "cascade" })
      .notNull(),
    jop: varchar("jop", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    doneAt: timestamp("done_at", { withTimezone: true }),
    dueAt: timestamp("due_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    )
  },
  (table) => {
    return {
      subjectId_index: index("subject_id_index_in_subjects_todos").on(
        table.subjectId
      ),
      jopIndex: index("jop_index_in_subjects_todos").on(table.jop)
    };
  }
);

export default subjectsTodosTable;
