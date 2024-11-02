"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsTable = exports.notificationFromEnum = exports.notificationTypeEnum = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = __importDefault(require("./user"));
const schema_1 = __importDefault(require("../../schema"));
exports.notificationTypeEnum = schema_1.default.enum("notification_type", [
    "new_follow_request",
    "new_follow",
    "new_love",
    "follow_accept",
    "system_update",
    "success",
    "warning",
    "email_verify",
    "trial_expiration"
]);
exports.notificationFromEnum = schema_1.default.enum("notification_from", [
    "user",
    "system"
]);
exports.notificationsTable = schema_1.default.table("notifications", {
    id: (0, pg_core_1.uuid)()
        .primaryKey()
        .notNull()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.uuid)()
        .references(() => user_1.default.id, { onDelete: "cascade" })
        .notNull(),
    type: (0, exports.notificationTypeEnum)("notification_type")
        .default("system_update")
        .notNull(),
    hasButton: (0, pg_core_1.boolean)("has_button").notNull().default(false),
    buttonLabel: (0, pg_core_1.varchar)("button_label", { length: 255 }),
    buttonLink: (0, pg_core_1.text)("button_link"),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    content: (0, pg_core_1.text)("content"),
    from: (0, exports.notificationFromEnum)("notification_from").default("system").notNull(),
    fromUserId: (0, pg_core_1.uuid)().references(() => user_1.default.id, { onDelete: "cascade" }),
    seenAt: (0, pg_core_1.timestamp)("seen_at", { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow()
}, (table) => {
    return {
        userId_index: (0, pg_core_1.index)("user_id_index_in_notifications").on(table.userId)
    };
});
exports.default = exports.notificationsTable;
