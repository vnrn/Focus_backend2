"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lovesTable = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = __importDefault(require("../personalDetails/user"));
const schema_1 = __importDefault(require("../../schema"));
exports.lovesTable = schema_1.default.table("loves", {
    id: (0, pg_core_1.uuid)()
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.uuid)().references(() => user_1.default.id, { onDelete: "cascade" }),
    loverId: (0, pg_core_1.uuid)().references(() => user_1.default.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow()
}, (table) => {
    return {
        userId_index: (0, pg_core_1.index)("user_id_index_in_loves").on(table.userId),
        loverId_index: (0, pg_core_1.index)("lover_id_index_in_loves").on(table.loverId)
    };
});
exports.default = exports.lovesTable;
