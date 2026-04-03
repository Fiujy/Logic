import { prisma } from "../lib/prisma.js";

export async function listPlayers(_req, res) {
  try {
    const players = await prisma.player.findMany({
      orderBy: { id: "asc" },
    });
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch players" });
  }
}
