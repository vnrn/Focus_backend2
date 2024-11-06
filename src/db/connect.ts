import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import "dotenv/config";
import Redis from "ioredis";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL as string
});

const db = drizzle(pool, { schema: schema });
const connection = db.$client.connect();

connection
  .then(() => {})
  .catch((e) => console.log("Error connecting to database", e));

const RedisClient = new Redis(process.env.REDIS_URL as string, {
  db: 0,
  password: process.env.REDIS_PASSWORD as string
});

RedisClient.on("error", () => {
  console.log("Redis connection error");
});

export default db;
export { RedisClient };
