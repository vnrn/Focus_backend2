import { sql } from "drizzle-orm";
import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import userTable from "../personalDetails/user";
import FOCUS from "../../schema";

export const lovesTable = FOCUS.table(
  "loves",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid().references(() => userTable.id, { onDelete: "cascade" }),
    loverId: uuid().references(() => userTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => {
    return {
      userId_index: index("user_id_index_in_loves").on(table.userId),
      loverId_index: index("lover_id_index_in_loves").on(table.loverId)
    };
  }
);

export default lovesTable;
