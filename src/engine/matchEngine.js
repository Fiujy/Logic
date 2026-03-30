import { distanceToCenter } from "./enemySystem.js";

const SYNONYM_SPEED_FACTOR = 1.5;

export const SCORE_ANTONYM = 100;
export const SCORE_SYNONYM_PENALTY = -20;

function normalize(text) {
  return text.trim().toLowerCase();
}

function matchesAntonym(enemy, input) {
  return enemy.antonyms.some((a) => normalize(a) === input);
}

function matchesSynonym(enemy, input) {
  return enemy.synonyms.some((s) => normalize(s) === input);
}

export function applyPlayerInput(enemies, rawInput) {
  const list = Array.isArray(enemies) ? enemies : [];
  const input = normalize(rawInput);
  if (!input) return { enemies: list, scoreDelta: 0 };

  const matches = [];
  for (const enemy of list) {
    if (matchesAntonym(enemy, input)) {
      matches.push({ enemy, kind: "antonym" });
    } else if (matchesSynonym(enemy, input)) {
      matches.push({ enemy, kind: "synonym" });
    }
  }
  if (matches.length === 0) return { enemies: list, scoreDelta: 0 };

  matches.sort(
    (a, b) => distanceToCenter(a.enemy) - distanceToCenter(b.enemy)
  );
  const best = matches[0];

  if (best.kind === "antonym") {
    return {
      enemies: list.filter((e) => e !== best.enemy),
      scoreDelta: SCORE_ANTONYM,
    };
  }

  return {
    enemies: list.map((e) =>
      e === best.enemy
        ? {
            ...e,
            speedMultiplier: (e.speedMultiplier ?? 1) * SYNONYM_SPEED_FACTOR,
          }
        : e
    ),
    scoreDelta: SCORE_SYNONYM_PENALTY,
  };
}
