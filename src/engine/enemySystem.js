import { getRandomWord } from "./wordEngine.js";

export const CENTER_X = 50;
export const CENTER_Y = 50;

export function distanceToCenter(enemy) {
  return Math.hypot(enemy.x - CENTER_X, enemy.y - CENTER_Y);
}

/** Enemies within this distance (percent coords) of the base count as a hit. */
export const BASE_HIT_RADIUS = 1;

export function removeEnemiesAtBase(enemies) {
  let baseHits = 0;
  const survivors = [];
  for (const enemy of enemies) {
    if (distanceToCenter(enemy) <= BASE_HIT_RADIUS) {
      baseHits += 1;
    } else {
      survivors.push(enemy);
    }
  }
  return { enemies: survivors, baseHits };
}

function randomEdgePosition() {
  const r = Math.random() * 4;
  if (r < 1) return { x: Math.random() * 100, y: 0 };
  if (r < 2) return { x: Math.random() * 100, y: 100 };
  if (r < 3) return { x: 0, y: Math.random() * 100 };
  return { x: 100, y: Math.random() * 100 };
}

export function createEnemy() {
  const difficulty = 1 + Math.floor(Math.random() * 3);
  const wordEntry = getRandomWord(difficulty);
  if (!wordEntry) return null;
  const pos = randomEdgePosition();
  return {
    id: crypto.randomUUID(),
    word: wordEntry.label,
    antonyms: wordEntry.antonyms,
    synonyms: wordEntry.synonyms,
    x: pos.x,
    y: pos.y,
    speedMultiplier: 1,
  };
}

export function updateEnemies(enemies, deltaSeconds, speedPercentPerSec = 12) {
  return enemies.map((enemy) => {
    const mult = enemy.speedMultiplier ?? 1;
    return moveTowardCenter(enemy, deltaSeconds, speedPercentPerSec * mult);
  });
}

function moveTowardCenter(enemy, dt, speed) {
  let dx = CENTER_X - enemy.x;
  let dy = CENTER_Y - enemy.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.25) {
    return { ...enemy, x: CENTER_X, y: CENTER_Y };
  }
  const step = Math.min(speed * dt, dist);
  return {
    ...enemy,
    x: enemy.x + (dx / dist) * step,
    y: enemy.y + (dy / dist) * step,
  };
}
