import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";
import userTable from "../personalDetails/user";
import FOCUS from "../../schema";

export const timeAnalyticsTable = FOCUS.table(
  "time_analytics",
  {
    id: uuid().primaryKey().notNull().unique(),
    userId: uuid()
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
    duration: integer("duration").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => {
    return {
      userId_index: index("user_id_index_in_time_analytics").on(table.userId)
    };
  }
);

export default timeAnalyticsTable;
