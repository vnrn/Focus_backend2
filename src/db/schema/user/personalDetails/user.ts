import { index, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import FOCUS from "../../schema";

export const providerEnum = FOCUS.enum("providers", [
  "google",
  "github",
  "local"
]);

export const usersTable = FOCUS.table(
  "user",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    username: varchar("username", { length: 30 }).unique().notNull(),
    email: varchar("email", { length: 255 }),
    password: text("password"),
    provider: providerEnum("provider").default("local").notNull(),
    providerId: varchar("provider_id", { length: 255 }),
    //tokens
    refreshToken: text("refresh_token"),
    verifyToken: text("verify_token"),
    resetPasswordToken: text("reset_password_token"),
    accountDeleteToken: text("account_delete_token"),
    //timestamps,
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    )
  },
  (t) => {
    return {
      usernameIndex: index("username_index_on_users").on(t.username)
    };
  }
);

export default usersTable;
