"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectsNotesTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const subjects_1 = require("./subjects");
const schema_1 = __importDefault(require("../../schema"));
exports.subjectsNotesTable = schema_1.default.table("subjects_notes", {
    id: (0, pg_core_1.uuid)().primaryKey().notNull().unique(),
    subjectId: (0, pg_core_1.uuid)().references(() => subjects_1.subjectsTable.id, {
        onDelete: "cascade"
    }),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    content: (0, pg_core_1.text)("content"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).$onUpdate(() => new Date())
}, (table) => {
    return {
        subjectId_index: (0, pg_core_1.index)("subject_id_index_in_subjects_notes").on(table.subjectId),
        titleIndex: (0, pg_core_1.index)("title_index_in_subjects_notes").on(table.title),
        contentIndex: (0, pg_core_1.index)("content_index_in_subjects_notes").on(table.content)
    };
});
exports.default = exports.subjectsNotesTable;
