import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL as string
});

const db = drizzle(pool, { schema: schema });
const connection = db.$client.connect();
connection
  .then(() => {
    console.log("Connected to database ✅");
  })
  .catch((e) => console.log("Error connecting to database", e));
export default db;
