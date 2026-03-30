import wordsJson from "../data/words.json";

const words = wordsJson;

export function loadWords() {
  return words;
}

export function getRandomWord(difficulty) {
  const pool = words.filter((w) => w.difficulty === difficulty);
  if (pool.length === 0) return null;
  const i = Math.floor(Math.random() * pool.length);
  return pool[i];
}
