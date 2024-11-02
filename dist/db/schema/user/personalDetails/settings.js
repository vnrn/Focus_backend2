"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsTable = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const schema_1 = __importDefault(require("../../schema"));
const user_1 = __importDefault(require("./user"));
exports.settingsTable = schema_1.default.table("settings", {
    id: (0, pg_core_1.uuid)()
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`)
        .notNull(),
    userId: (0, pg_core_1.uuid)()
        .unique()
        .references(() => user_1.default.id, { onDelete: "cascade" })
        .notNull(),
    pushNotifications: (0, pg_core_1.boolean)("push_notifications").default(true),
    emailNotifications: (0, pg_core_1.boolean)("email_notifications").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).$onUpdate(() => new Date())
}, (t) => {
    return {
        userIdIndex: (0, pg_core_1.index)("user_id_index_on_settings").on(t.userId)
    };
});
exports.default = exports.settingsTable;
