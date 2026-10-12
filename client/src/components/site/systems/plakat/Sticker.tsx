import React from "react";
import type { Sticker } from "./facts";

/** Ab so vielen Zeichen wird die große Zeile kleiner gesetzt. */
const LONG = 5;
const XLONG = 7;
/** Ab so vielen Zeichen wird die kleine Zeile feiner gesetzt. */
const SMALL_FINE = 10;

/**
 * Runder Sticker (Systemblatt 08): Signal, −9°, gestrichelter Innenring.
 * Auf einem Farbfeld tief (`inv`). Ein Satz für Vorleser.
 */
export function PlakatSticker({
  sticker,
  inv = false,
  className = "",
}: {
  sticker: Sticker;
  inv?: boolean;
  className?: string;
}) {
  const size =
    sticker.big.length > XLONG
      ? " pk-stk--xlong"
      : sticker.big.length > LONG
        ? " pk-stk--long"
        : "";
  return (
    <p
      className={`pk-stk${inv ? " pk-stk--inv" : ""}${size}${className ? ` ${className}` : ""}`}
    >
      <span className="pk-stk-in">
        <b>{sticker.big}</b>
        {sticker.small && <span> {sticker.small}</span>}
      </span>
    </p>
  );
}
