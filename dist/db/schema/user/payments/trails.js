"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trailsTable = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = __importDefault(require("../personalDetails/user"));
const schema_1 = __importDefault(require("../../schema"));
exports.trailsTable = schema_1.default.table("trails", {
    id: (0, pg_core_1.uuid)()
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`)
        .notNull(),
    userId: (0, pg_core_1.uuid)()
        .unique()
        .references(() => user_1.default.id, { onDelete: "cascade" })
        .notNull(),
    trail_start: (0, pg_core_1.timestamp)("trail_start", { withTimezone: true })
        .notNull()
        .defaultNow(),
    trail_end: (0, pg_core_1.timestamp)("trail_end", { withTimezone: true })
});
exports.default = exports.trailsTable;
