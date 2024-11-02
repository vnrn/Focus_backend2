import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";
import userTable from "../personalDetails/user";
import FOCUS from "../../schema";

export const subscriptionStatusEnum = FOCUS.enum("subscription_status", [
  "active",
  "expired",
  "canceled"
]);

export const subscriptionProviderEnum = FOCUS.enum("subscription_provider", [
  "stripe",
  "paypal"
]);

export const subscriptionsTable = FOCUS.table(
  "subscriptions",
  {
    id: uuid()
      .default(sql`gen_random_uuid()`)
      .primaryKey()
      .notNull(),
    userId: uuid()
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    subscriptionProvider: subscriptionProviderEnum(
      "subscription_provider"
    ).notNull(),
    providerCustomerId: text("provider_customer_id").notNull(),
    providerSubscriptionId: text("provider_subscription_id").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull()
  },
  (table) => {
    return {
      providerSubscriptionIdIndex: index(
        "provider_subscription_id_on_subscriptions"
      ).on(table.providerSubscriptionId)
    };
  }
);

export default subscriptionsTable;
