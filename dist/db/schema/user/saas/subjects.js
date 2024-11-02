"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = __importDefault(require("../personalDetails/user"));
const schema_1 = __importDefault(require("../../schema"));
exports.subjectsTable = schema_1.default.table("subjects", {
    id: (0, pg_core_1.uuid)().primaryKey().notNull().unique(),
    userId: (0, pg_core_1.uuid)()
        .references(() => user_1.default.id, { onDelete: "cascade" })
        .notNull(),
    label: (0, pg_core_1.varchar)("label").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).$onUpdate(() => new Date())
}, (table) => {
    return {
        userId_index: (0, pg_core_1.index)("user_id_index_in_subjects").on(table.userId),
        label_index: (0, pg_core_1.index)("label_index_in_subjects").on(table.label)
    };
});
exports.default = exports.subjectsTable;
