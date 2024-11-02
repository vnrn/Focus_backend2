import { createClient } from "redis";
import "dotenv/config";

//that's the cache redis database
const Redis = createClient({
  url: process.env.REDIS_URL as string,
  database: 0
});
Redis.on("error", (err) => console.log("Redis Client Error", err));
Redis.on("connect", () => {
  console.log("Redis Client Connected");
});

export default Redis;
