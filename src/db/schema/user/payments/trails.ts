import { sql } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import userTable from "../personalDetails/user";
import FOCUS from "../../schema";

export const trailsTable = FOCUS.table("trails", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  userId: uuid()
    .unique()
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  trail_start: timestamp("trail_start", { withTimezone: true })
    .notNull()
    .defaultNow(),
  trail_end: timestamp("trail_end", { withTimezone: true })
});

export default trailsTable;
