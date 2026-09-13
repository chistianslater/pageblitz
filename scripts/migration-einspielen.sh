#!/usr/bin/env bash
#
# Eine SQL-Migration auf dem Server einspielen (2026-09-13).
#
# Anlass: In der Anleitung stand jahrelang `mysql -u <user> -p <db> < …`.
# Die spitzen Klammern sind in der Bash Umleitungszeichen — wer die Zeile
# kopiert, bekommt „syntax error near unexpected token" und muss sich die
# Zugangsdaten erst aus der .env suchen. Das hier nimmt sie selbst aus
# DATABASE_URL und zeigt das Passwort nirgends an.
#
#   ./scripts/migration-einspielen.sh drizzle/0034_postkarten_motiv.sql
#   ./scripts/migration-einspielen.sh --trocken drizzle/0034_*.sql
#
# `--trocken` zeigt nur, was laufen wuerde (ohne Passwort), und fasst die
# Datenbank nicht an.

set -Eeuo pipefail

trocken=0
datei=""
for arg in "$@"; do
  case "$arg" in
    --trocken) trocken=1 ;;
    *) datei="$arg" ;;
  esac
done

if [[ -z "$datei" ]]; then
  echo "Aufruf: $0 [--trocken] <migration.sql>" >&2
  exit 1
fi
if [[ ! -f "$datei" ]]; then
  echo "FEHLER: $datei gibt es nicht." >&2
  exit 1
fi

# Repo-Wurzel, damit der Aufruf auch aus einem Unterordner klappt.
WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${DATABASE_URL:-}" ]]; then
  if [[ -f "$WURZEL/.env" ]]; then
    # Nur DATABASE_URL herausziehen, statt die ganze .env zu sourcen: Dort
    # stehen Schluessel, die in dieser Shell nichts verloren haben.
    DATABASE_URL="$(grep -m1 '^DATABASE_URL=' "$WURZEL/.env" | cut -d= -f2- | sed 's/^["'\'']//; s/["'\'']$//')"
  fi
fi
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "FEHLER: DATABASE_URL weder in der Umgebung noch in $WURZEL/.env." >&2
  exit 1
fi

# Zerlegen mit node: Passwoerter enthalten Sonderzeichen, die eine
# Regex-Loesung in der Shell frueher oder spaeter falsch zerlegt.
eval "$(
  DATABASE_URL="$DATABASE_URL" node -e '
    const u = new URL(process.env.DATABASE_URL);
    const q = s => "\x27" + String(s).replace(/\x27/g, "\x27\\\x27\x27") + "\x27";
    console.log(`DB_USER=${q(decodeURIComponent(u.username))}`);
    console.log(`DB_HOST=${q(u.hostname)}`);
    console.log(`DB_PORT=${q(u.port || "3306")}`);
    console.log(`DB_NAME=${q(u.pathname.replace(/^\//, ""))}`);
    console.log(`MYSQL_PWD=${q(decodeURIComponent(u.password))}`);
  '
)"
export MYSQL_PWD

echo "Migration: $datei"
echo "Ziel:      $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"

if [[ "$trocken" == "1" ]]; then
  echo "Trockenlauf — es wurde nichts eingespielt."
  echo "Inhalt:"
  sed 's/^/  /' "$datei"
  exit 0
fi

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" < "$datei"
echo "Eingespielt. Bei additiven Migrationen reicht danach: pm2 restart pageblitz"
