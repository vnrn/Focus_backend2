"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeAnalyticsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = __importDefault(require("../personalDetails/user"));
const schema_1 = __importDefault(require("../../schema"));
exports.timeAnalyticsTable = schema_1.default.table("time_analytics", {
    id: (0, pg_core_1.uuid)().primaryKey().notNull().unique(),
    userId: (0, pg_core_1.uuid)()
        .references(() => user_1.default.id, { onDelete: "cascade" })
        .notNull(),
    startedAt: (0, pg_core_1.timestamp)("started_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    endedAt: (0, pg_core_1.timestamp)("ended_at", { withTimezone: true }).notNull(),
    duration: (0, pg_core_1.integer)("duration").default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow()
}, (table) => {
    return {
        userId_index: (0, pg_core_1.index)("user_id_index_in_time_analytics").on(table.userId)
    };
});
exports.default = exports.timeAnalyticsTable;
