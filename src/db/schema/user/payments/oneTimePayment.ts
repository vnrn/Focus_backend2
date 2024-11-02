import { sql } from "drizzle-orm";
import {
  decimal,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";
import userTable from "../personalDetails/user";
import FOCUS from "../../schema";

export const paymentProviderEnum = FOCUS.enum("payment_provider", [
  "stripe",
  "paypal"
]);

export const oneTimePaymentsTable = FOCUS.table(
  "one_time_payments",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    userId: uuid()
      .references(() => userTable.id, { onDelete: "cascade" })
      .unique(),
    payment_provider: paymentProviderEnum("payment_provider")
      .default("stripe")
      .notNull(),
    paymentId: text("payment_id").notNull(),
    amount: decimal("amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => {
    return {
      paymentIdIndex: index("payment_id_index").on(table.paymentId)
    };
  }
);

export default oneTimePaymentsTable;
