import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * `DATABASE_URL` must point at your PostgreSQL instance, e.g.:
 * postgresql://USER:PASSWORD@localhost:5432/DATABASE?schema=public
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.js",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
