import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle/migrations",
  schema: "./src/db/schema/",
  dbCredentials: {
    url: process.env.DATABASE_URL as string
  }
});
