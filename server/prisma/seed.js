/**
 * Seed : 2 joueurs, 2 parties, 2 scores, 5 relations antonymes (RelationWord).
 *
 * Le modèle impose un `wordIdTarget` vers la table `Word` : chaque extrémité
 * d’une paire est un enregistrement. Donc 5 paires ⇒ 10 lignes `Word` et 5 `RelationWord`.
 */
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** Paires simples : français → antonyme (une `RelationWord` par paire). */
const ANTONYM_PAIRS = [
  ["noir", "blanc"],
  ["chaud", "froid"],
  ["grand", "petit"],
  ["jour", "nuit"],
  ["rapide", "lent"],
];

function isSchemaMissingError(e) {
  const msg = String(e?.message ?? "");
  return (
    e?.code === "P2021" ||
    msg.includes("does not exist") ||
    msg.includes("TableDoesNotExist")
  );
}

async function main() {
  try {
    await prisma.player.findFirst();
  } catch (e) {
    if (isSchemaMissingError(e)) {
      console.error(
        "Base sans tables Prisma. Enchaîne une fois :\n" +
          "  npm run db:setup\n" +
          "(équivalent à `npm run db:push` puis `prisma db seed`.)"
      );
      process.exit(1);
    }
    throw e;
  }

  await prisma.$transaction([
    prisma.gameWord.deleteMany(),
    prisma.relationWord.deleteMany(),
    prisma.score.deleteMany(),
    prisma.game.deleteMany(),
    prisma.word.deleteMany(),
    prisma.player.deleteMany(),
  ]);

  const [p1, p2] = await prisma.$transaction([
    prisma.player.create({
      data: { username: "marie", email: "marie@exemple.fr" },
    }),
    prisma.player.create({
      data: { username: "luc", email: "luc@exemple.fr" },
    }),
  ]);

  const [g1, g2] = await prisma.$transaction([
    prisma.game.create({
      data: {
        playerId: p1.id,
        startedAt: new Date("2026-01-15T14:00:00.000Z"),
        endedAt: new Date("2026-01-15T14:12:00.000Z"),
      },
    }),
    prisma.game.create({
      data: {
        playerId: p2.id,
        startedAt: new Date("2026-01-16T10:30:00.000Z"),
        endedAt: null,
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.score.create({ data: { gameId: g1.id, value: 420 } }),
    prisma.score.create({ data: { gameId: g2.id, value: 280 } }),
  ]);

  const relations = [];
  let difficulty = 1;
  for (const [a, b] of ANTONYM_PAIRS) {
    const [src, tgt] = await prisma.$transaction([
      prisma.word.create({
        data: { label: a, difficulty },
      }),
      prisma.word.create({
        data: { label: b, difficulty },
      }),
    ]);
    relations.push({
      wordIdSource: src.id,
      wordIdTarget: tgt.id,
      type: "antonym",
    });
    difficulty = difficulty >= 3 ? 1 : difficulty + 1;
  }

  await prisma.relationWord.createMany({ data: relations });
}

main()
  .then(async () => {
    console.log(
      "Seed terminé : 2 players, 2 games, 2 scores, 10 words (5 paires), 5 relationWord antonym."
    );
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
