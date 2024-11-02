"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilesTable = exports.genders = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const schema_1 = __importDefault(require("../../schema"));
const drizzle_orm_1 = require("drizzle-orm");
const user_1 = __importStar(require("./user"));
exports.genders = schema_1.default.enum("genders", [
    "male",
    "female",
    "prefer not to say"
]);
exports.profilesTable = schema_1.default.table("profile", {
    id: (0, pg_core_1.uuid)()
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`)
        .notNull(),
    userId: (0, pg_core_1.uuid)()
        .references(() => user_1.default.id, { onDelete: "cascade" })
        .notNull(),
    bio: (0, pg_core_1.varchar)("bio", { length: 255 }),
    wishes: (0, pg_core_1.integer)("wishes").default(0),
    avatarId: (0, pg_core_1.text)("avatar_id"),
    prefferredAvatar: (0, user_1.providerEnum)("prefferred_avatar")
        .default("local")
        .notNull(),
    profileViews: (0, pg_core_1.integer)("profile_views").default(0),
    isPrivate: (0, pg_core_1.boolean)("is_private").default(true),
    gender: (0, exports.genders)("gender").default("prefer not to say").notNull(),
    displaySubjects: (0, pg_core_1.boolean)("display_subjects").default(true),
    displaySubjectsNotes: (0, pg_core_1.boolean)("display_subjects_notes").default(true),
    displaySubjectsTodos: (0, pg_core_1.boolean)("display_subjects_todos").default(true),
    displaySubjectsAnalytics: (0, pg_core_1.boolean)("display_subjects_analytics").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).$onUpdate(() => new Date())
});
exports.default = exports.profilesTable;
