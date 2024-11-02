"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
require("dotenv/config");
//that's the cache redis database
const Redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
    database: 0
});
Redis.on("error", (err) => console.log("Redis Client Error", err));
Redis.on("connect", () => {
    console.log("Redis Client Connected");
});
exports.default = Redis;
