import { useState, useEffect, useRef } from "react";
import { Hud } from "./components/Hud.jsx";
import { GameArea } from "./components/GameArea.jsx";
import { CommandInput } from "./components/CommandInput.jsx";
import { createEnemy } from "./engine/enemySystem.js";
import { createGameLoop, stepGame } from "./engine/gameEngine.js";
import { applyPlayerInput } from "./engine/matchEngine.js";

const SPAWN_INTERVAL_MS = 3000;

export default function App() {
  const typingSlowRef = useRef(false);
  const [game, setGame] = useState({
    enemies: [],
    baseHp: 100,
    score: 0,
  });

  useEffect(() => {
    const spawn = () => {
      const enemy = createEnemy();
      if (!enemy) return;
      setGame((g) => ({
        ...g,
        enemies: [...(g.enemies ?? []), enemy],
      }));
    };
    spawn();
    const id = setInterval(spawn, SPAWN_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const loop = createGameLoop((deltaTime) => {
      setGame((g) => {
        const { enemies, baseHits } = stepGame(
          g.enemies ?? [],
          deltaTime,
          typingSlowRef.current
        );
        return {
          ...g,
          enemies,
          baseHp: Math.max(0, g.baseHp - baseHits),
        };
      });
    });
    loop.start();
    return () => loop.stop();
  }, []);

  function handleCommandSubmit(text) {
    setGame((g) => {
      const { enemies, scoreDelta } = applyPlayerInput(g.enemies ?? [], text);
      return {
        ...g,
        enemies: enemies ?? [],
        score: g.score + (scoreDelta ?? 0),
      };
    });
  }

  return (
    <div className="app">
      <Hud score={game.score} baseHp={game.baseHp} />
      <GameArea enemies={game.enemies} />
      <CommandInput
        onSubmit={handleCommandSubmit}
        onTypingSlowChange={(slow) => {
          typingSlowRef.current = slow;
        }}
      />
    </div>
  );
}
