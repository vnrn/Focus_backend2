import { sql } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

import userTable from "../personalDetails/user";
import FOCUS from "../../schema";

export const followingTable = FOCUS.table(
  "following",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    userId: uuid()
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    followingUserId: uuid()
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    uniqueFollow: uniqueIndex("unique_follow_on_following").on(
      table.userId,
      table.followingUserId
    )
  })
);

export default followingTable;
