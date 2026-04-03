import { prisma } from "../lib/prisma.js";

const wordInclude = {
  sourceRelations: { include: { targetWord: true } },
  targetRelations: { include: { sourceWord: true } },
};

function collectByType(word) {
  const antonyms = new Map();
  const synonyms = new Map();

  function add(type, related) {
    const entry = {
      id: related.id,
      label: related.label,
      difficulty: related.difficulty,
    };
    if (type === "antonym") antonyms.set(related.id, entry);
    else if (type === "synonym") synonyms.set(related.id, entry);
  }

  for (const rel of word.sourceRelations) {
    add(rel.type, rel.targetWord);
  }
  for (const rel of word.targetRelations) {
    add(rel.type, rel.sourceWord);
  }

  return {
    antonyms: [...antonyms.values()],
    synonyms: [...synonyms.values()],
  };
}

function serializeWord(w) {
  const { antonyms, synonyms } = collectByType(w);
  return {
    id: w.id,
    label: w.label,
    difficulty: w.difficulty,
    antonyms,
    synonyms,
  };
}

function difficultyWhere(query) {
  const raw = query.difficulty;
  if (raw === undefined || raw === "") {
    return {};
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    return null;
  }
  return { difficulty: n };
}

export async function listWords(_req, res) {
  try {
    const words = await prisma.word.findMany({
      include: wordInclude,
      orderBy: { id: "asc" },
    });

    res.json(words.map(serializeWord));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch words" });
  }
}

export async function getRandomWord(req, res) {
  try {
    const where = difficultyWhere(req.query);
    if (where === null) {
      return res.status(400).json({
        error: "difficulty must be a positive integer",
      });
    }

    const candidates = await prisma.word.findMany({
      where,
      select: { id: true },
    });

    if (candidates.length === 0) {
      return res.status(404).json({ error: "No word found for this filter" });
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const word = await prisma.word.findUnique({
      where: { id: pick.id },
      include: wordInclude,
    });

    res.json(serializeWord(word));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch random word" });
  }
}
