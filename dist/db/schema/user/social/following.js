"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followingTable = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = __importDefault(require("../personalDetails/user"));
const schema_1 = __importDefault(require("../../schema"));
exports.followingTable = schema_1.default.table("following", {
    id: (0, pg_core_1.uuid)()
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`)
        .notNull(),
    userId: (0, pg_core_1.uuid)()
        .references(() => user_1.default.id, { onDelete: "cascade" })
        .notNull(),
    followingUserId: (0, pg_core_1.uuid)()
        .references(() => user_1.default.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow()
}, (table) => ({
    uniqueFollow: (0, pg_core_1.uniqueIndex)("unique_follow_on_following").on(table.userId, table.followingUserId)
}));
exports.default = exports.followingTable;
