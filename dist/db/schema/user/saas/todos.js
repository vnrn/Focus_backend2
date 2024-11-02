"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectsTodosTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const subjects_1 = require("./subjects");
const schema_1 = __importDefault(require("../../schema"));
exports.subjectsTodosTable = schema_1.default.table("subjects_todos", {
    id: (0, pg_core_1.uuid)().primaryKey().notNull().unique(),
    subjectId: (0, pg_core_1.uuid)()
        .references(() => subjects_1.subjectsTable.id, { onDelete: "cascade" })
        .notNull(),
    jop: (0, pg_core_1.varchar)("jop", { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    doneAt: (0, pg_core_1.timestamp)("done_at", { withTimezone: true }),
    dueAt: (0, pg_core_1.timestamp)("due_at", { withTimezone: true }),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).$onUpdate(() => new Date())
}, (table) => {
    return {
        subjectId_index: (0, pg_core_1.index)("subject_id_index_in_subjects_todos").on(table.subjectId),
        jopIndex: (0, pg_core_1.index)("jop_index_in_subjects_todos").on(table.jop)
    };
});
exports.default = exports.subjectsTodosTable;
