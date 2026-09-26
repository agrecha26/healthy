import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.postgresql://postgres:postgres@127.0.0.1:5432/app_db) {
  throw new Error("DATABASE_URL is required. Copy .env.example to .env and set the PostgreSQL connection URL.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.postgresql://postgres:postgres@127.0.0.1:5432/app_db,
  },
});
