import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

/**
 * Pool + client partagés pour toute l’app (cache de module Node = une seule instance).
 */
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

/**
 * À appeler à l’arrêt du process (SIGTERM, tests, etc.).
 */
export async function disconnectDb() {
  await prisma.$disconnect();
  await pool.end();
}
