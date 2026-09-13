import React, { useEffect, useState } from "react";
import { StartForm } from "./shared";
/** Animated placeholder only: example text never becomes a submitted value. */
export default function TypingStart() {
  const [hint, setHint] = useState("");
  const [stopped, setStopped] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let index = 0,
      letter = 0,
      deleting = false;
    const names = ["Salon Schneider", "Café Morgenrot", "Tischlerei Weber"];
    const tick = () => {
      if (media.matches || stopped) return;
      const name = names[index];
      letter += deleting ? -1 : 1;
      setHint(name.slice(0, letter));
      let delay = deleting ? 45 : 100;
      if (letter === name.length) {
        deleting = true;
        delay = 1700;
      }
      if (letter === 0) {
        deleting = false;
        index = (index + 1) % names.length;
        delay = 650;
      }
      timer = setTimeout(tick, delay);
    };
    const restart = () => {
      clearTimeout(timer);
      setHint("");
      if (!media.matches && !stopped) timer = setTimeout(tick, 750);
    };
    restart();
    media.addEventListener("change", restart);
    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", restart);
    };
  }, [stopped]);
  return (
    <div
      className={`clear-typing-start ${stopped ? "typing-stopped" : ""}`}
      onFocusCapture={() => setStopped(true)}
      onPointerDown={() => setStopped(true)}
    >
      <StartForm
        id="clear-hero-business"
        label="Meine Website ansehen"
        placeholder={hint || "Name deines Betriebs"}
      />
      {!stopped && (
        <span className="typing-example">
          Beispielname · Starte mit deinem eigenen Betrieb
        </span>
      )}
    </div>
  );
}
