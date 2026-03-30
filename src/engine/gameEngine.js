import { updateEnemies, removeEnemiesAtBase } from "./enemySystem.js";

export const MAX_DELTA_TIME = 0.05;

const BASE_MOVE_SPEED = 12;
/** While the player is typing, world speed is multiplied by this factor. */
export const TYPING_SLOW_FACTOR = 0.5;

export function stepGame(enemies, deltaTime, typingSlow = false) {
  const list = Array.isArray(enemies) ? enemies : [];
  const speed =
    BASE_MOVE_SPEED * (typingSlow ? TYPING_SLOW_FACTOR : 1);
  const moved = updateEnemies(list, deltaTime, speed);
  return removeEnemiesAtBase(moved);
}

export function createGameLoop(onFrame) {
  let rafId = null;
  let lastTimestamp = null;

  function frame(timestamp) {
    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
      rafId = requestAnimationFrame(frame);
      return;
    }
    let deltaTime = (timestamp - lastTimestamp) / 1000;
    if (deltaTime > MAX_DELTA_TIME) {
      deltaTime = MAX_DELTA_TIME;
    }
    lastTimestamp = timestamp;
    onFrame(deltaTime);
    rafId = requestAnimationFrame(frame);
  }

  return {
    start() {
      lastTimestamp = null;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      rafId = null;
      lastTimestamp = null;
    },
  };
}
