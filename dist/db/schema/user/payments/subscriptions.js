"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionsTable = exports.subscriptionProviderEnum = exports.subscriptionStatusEnum = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = __importDefault(require("../personalDetails/user"));
const schema_1 = __importDefault(require("../../schema"));
exports.subscriptionStatusEnum = schema_1.default.enum("subscription_status", [
    "active",
    "expired",
    "canceled"
]);
exports.subscriptionProviderEnum = schema_1.default.enum("subscription_provider", [
    "stripe",
    "paypal"
]);
exports.subscriptionsTable = schema_1.default.table("subscriptions", {
    id: (0, pg_core_1.uuid)()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`)
        .primaryKey()
        .notNull(),
    userId: (0, pg_core_1.uuid)()
        .references(() => user_1.default.id, { onDelete: "cascade" })
        .notNull(),
    subscriptionProvider: (0, exports.subscriptionProviderEnum)("subscription_provider").notNull(),
    providerCustomerId: (0, pg_core_1.text)("provider_customer_id").notNull(),
    providerSubscriptionId: (0, pg_core_1.text)("provider_subscription_id").notNull(),
    status: (0, exports.subscriptionStatusEnum)("status").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow()
        .notNull()
}, (table) => {
    return {
        providerSubscriptionIdIndex: (0, pg_core_1.index)("provider_subscription_id_on_subscriptions").on(table.providerSubscriptionId)
    };
});
exports.default = exports.subscriptionsTable;
