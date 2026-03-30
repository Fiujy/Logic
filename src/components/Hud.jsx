export function Hud({ score, baseHp }) {
  return (
    <header className="hud" role="banner">
      <span className="hud__stat">Score: {score}</span>
      <span className="hud__stat">Base HP: {baseHp}</span>
    </header>
  );
}
