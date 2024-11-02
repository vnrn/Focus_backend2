"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followQueueTable = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = __importDefault(require("../personalDetails/user"));
const schema_1 = __importDefault(require("../../schema"));
exports.followQueueTable = schema_1.default.table("follow_queue", {
    id: (0, pg_core_1.uuid)()
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`)
        .notNull(),
    userId: (0, pg_core_1.uuid)().references(() => user_1.default.id, { onDelete: "cascade" }),
    followerUserId: (0, pg_core_1.uuid)().references(() => user_1.default.id, {
        onDelete: "cascade"
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow()
}, (table) => {
    return {
        followerUserId_index: (0, pg_core_1.index)("follower_user_id_index_in_follow_queue").on(table.followerUserId),
        userId_index: (0, pg_core_1.index)("user_id_index_in_follow_queue").on(table.userId)
    };
});
exports.default = exports.followQueueTable;
