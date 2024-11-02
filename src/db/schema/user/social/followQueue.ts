import { sql } from "drizzle-orm";
import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import userTable from "../personalDetails/user";
import FOCUS from "../../schema";

export const followQueueTable = FOCUS.table(
  "follow_queue",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    userId: uuid().references(() => userTable.id, { onDelete: "cascade" }),
    followerUserId: uuid().references(() => userTable.id, {
      onDelete: "cascade"
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => {
    return {
      followerUserId_index: index("follower_user_id_index_in_follow_queue").on(
        table.followerUserId
      ),
      userId_index: index("user_id_index_in_follow_queue").on(table.userId)
    };
  }
);

export default followQueueTable;
