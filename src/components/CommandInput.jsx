import { useState } from "react";

export function CommandInput({ onSubmit, onTypingSlowChange }) {
  const [value, setValue] = useState("");

  function handleKeyDown(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    onSubmit?.(value);
    setValue("");
  }

  return (
    <footer className="command-bar">
      <label className="command-bar__label" htmlFor="command-input">
        Input
      </label>
      <input
        id="command-input"
        className="command-bar__input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => onTypingSlowChange?.(true)}
        onBlur={() => onTypingSlowChange?.(false)}
        placeholder="Type a command…"
        autoComplete="off"
      />
    </footer>
  );
}
