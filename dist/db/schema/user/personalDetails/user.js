"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersTable = exports.providerEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = __importDefault(require("../../schema"));
exports.providerEnum = schema_1.default.enum("providers", [
    "google",
    "github",
    "local"
]);
exports.usersTable = schema_1.default.table("user", {
    id: (0, pg_core_1.uuid)("id")
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`)
        .primaryKey(),
    username: (0, pg_core_1.varchar)("username", { length: 30 }).unique().notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }),
    password: (0, pg_core_1.text)("password"),
    provider: (0, exports.providerEnum)("provider").default("local").notNull(),
    providerId: (0, pg_core_1.varchar)("provider_id", { length: 255 }),
    //tokens
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    verifyToken: (0, pg_core_1.text)("verify_token"),
    resetPasswordToken: (0, pg_core_1.text)("reset_password_token"),
    accountDeleteToken: (0, pg_core_1.text)("account_delete_token"),
    //timestamps,
    verifiedAt: (0, pg_core_1.timestamp)("verified_at", { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).$onUpdate(() => new Date())
}, (t) => {
    return {
        usernameIndex: (0, pg_core_1.index)("username_index_on_users").on(t.username)
    };
});
exports.default = exports.usersTable;
