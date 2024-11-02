"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneTimePaymentsTable = exports.paymentProviderEnum = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = __importDefault(require("../personalDetails/user"));
const schema_1 = __importDefault(require("../../schema"));
exports.paymentProviderEnum = schema_1.default.enum("payment_provider", [
    "stripe",
    "paypal"
]);
exports.oneTimePaymentsTable = schema_1.default.table("one_time_payments", {
    id: (0, pg_core_1.uuid)()
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`)
        .notNull(),
    userId: (0, pg_core_1.uuid)()
        .references(() => user_1.default.id, { onDelete: "cascade" })
        .unique(),
    payment_provider: (0, exports.paymentProviderEnum)("payment_provider")
        .default("stripe")
        .notNull(),
    paymentId: (0, pg_core_1.text)("payment_id").notNull(),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow()
}, (table) => {
    return {
        paymentIdIndex: (0, pg_core_1.index)("payment_id_index").on(table.paymentId)
    };
});
exports.default = exports.oneTimePaymentsTable;
