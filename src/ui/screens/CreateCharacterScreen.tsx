import { type FormEvent, useState } from "react";
import { useGameStore } from "../../game/state/gameStore";

export function CreateCharacterScreen() {
  const { createCharacter, errorMessage, status } = useGameStore();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);

    try {
      await createCharacter(name);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="app-shell centered-shell">
      <section className="create-card">
        <p className="eyebrow">MVP Plus</p>
        <h1>修仙挂机 MVP Plus</h1>
        <p className="description">
          山门初启，先为这段道途留下一个名字。留空也可直接开始修行。
        </p>

        <form className="create-form" onSubmit={handleSubmit}>
          <label htmlFor="character-name">角色名</label>
          <input
            autoFocus
            id="character-name"
            maxLength={16}
            onChange={(event) => setName(event.target.value)}
            placeholder="无名修士"
            type="text"
            value={name}
          />

          {status === "error" && errorMessage !== undefined ? (
            <div className="inline-error">{errorMessage}</div>
          ) : null}

          <button className="primary-button" disabled={isCreating} type="submit">
            {isCreating ? "正在开辟洞府..." : "开始修行"}
          </button>
        </form>
      </section>
    </main>
  );
}
