import "dotenv/config";
import app from "./app.js";
import { disconnectDb } from "./lib/prisma.js";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, closing server…`);
  server.close(async () => {
    await disconnectDb().catch(() => {});
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
