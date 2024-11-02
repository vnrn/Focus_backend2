import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { subjectsTable } from "./subjects";
import { sql } from "drizzle-orm";
import FOCUS from "../../schema";

export const subjectsNotesTable = FOCUS.table(
  "subjects_notes",
  {
    id: uuid().primaryKey().notNull().unique(),
    subjectId: uuid().references(() => subjectsTable.id, {
      onDelete: "cascade"
    }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    )
  },
  (table) => {
    return {
      subjectId_index: index("subject_id_index_in_subjects_notes").on(
        table.subjectId
      ),
      titleIndex: index("title_index_in_subjects_notes").on(table.title),
      contentIndex: index("content_index_in_subjects_notes").on(table.content)
    };
  }
);

export default subjectsNotesTable;
