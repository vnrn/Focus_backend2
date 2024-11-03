import Redis from "ioredis";
import "dotenv/config";

const RedisClient = new Redis(process.env.REDIS_URL as string, {
  db: 0,
  password: process.env.REDIS_PASSWORD as string
});

RedisClient.on("connect", () => {
  console.log("Connected to Redis");
});

export { RedisClient };
