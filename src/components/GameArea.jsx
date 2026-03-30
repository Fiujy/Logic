export function GameArea({ enemies = [] }) {
  const list = Array.isArray(enemies) ? enemies : [];
  return (
    <main className="game-area" role="main" aria-label="Game area">
      <div className="base" aria-hidden="true">
        <span className="base__label">Base</span>
      </div>
      {list.map((enemy) => (
        <div
          key={enemy.id}
          className="enemy"
          style={{
            left: `${enemy.x}%`,
            top: `${enemy.y}%`,
          }}
        >
          {enemy.word}
        </div>
      ))}
    </main>
  );
}
