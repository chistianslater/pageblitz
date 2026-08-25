#!/usr/bin/env bash
#
# Automatisches Pageblitz-Deployment (VPS-seitig).
#
# Wird vom systemd-Timer `pageblitz-auto-deploy.timer` einmal pro Minute
# gestartet. Der VPS holt `origin/main` selbst ab — dadurch braucht der
# Cursor-Agent keinen SSH-Zugriff (dessen wechselnde Cloud-IP wurde vom VPS
# wiederholt geblockt). Nur ein neuer, noch nicht erfolgreich gebauter Commit
# löst Build + PM2-Restart aus.
#
# Robustheit:
# - flock verhindert parallele Deployments bei langsamem npm/build.
# - Fast-forward-only: keine Server-Commits werden überschrieben.
# - Marker wird ERST nach erfolgreichem Build + Restart geschrieben. Schlägt
#   etwas fehl, versucht der nächste Timer-Lauf denselben Commit erneut.
# - Dependencies werden nur installiert, wenn sich package*.json seit dem
#   letzten erfolgreichen Deploy geändert haben.

set -Eeuo pipefail

REPO_DIR="${PAGEBLITZ_REPO_DIR:-/root/pageblitz}"
PROCESS_NAME="${PAGEBLITZ_PM2_PROCESS:-pageblitz}"
STATE_DIR="${PAGEBLITZ_DEPLOY_STATE_DIR:-/var/lib/pageblitz-auto-deploy}"
MARKER_FILE="$STATE_DIR/last-successful-commit"
LOCK_FILE="${PAGEBLITZ_DEPLOY_LOCK_FILE:-/var/lock/pageblitz-auto-deploy.lock}"

log() {
  printf '[pageblitz-auto-deploy] %s %s\n' "$(date --iso-8601=seconds)" "$*"
}

# Ein langsamer Build darf nicht von der nächsten Timer-Ausführung überholt
# werden. `-n` bedeutet: ein zweiter Lauf beendet sich still, statt zu warten.
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  log "Deployment läuft bereits — überspringe."
  exit 0
fi

if [[ ! -d "$REPO_DIR/.git" ]]; then
  log "FEHLER: Kein Git-Repository unter $REPO_DIR."
  exit 1
fi

# Interaktive Root-Shells laden NVM automatisch; systemd nicht. Beide üblichen
# NVM-Pfade berücksichtigen, danach müssen node/npm/pm2 verfügbar sein.
export NVM_DIR="${NVM_DIR:-/root/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck disable=SC1091
  source "$NVM_DIR/nvm.sh"
fi
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

for command_name in git npm pm2 flock; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    log "FEHLER: $command_name ist im systemd-PATH nicht verfügbar."
    exit 1
  fi
done

mkdir -p "$STATE_DIR"
cd "$REPO_DIR"

git fetch --quiet origin main
remote_commit="$(git rev-parse origin/main)"
current_commit="$(git rev-parse HEAD)"
deployed_commit=""
if [[ -f "$MARKER_FILE" ]]; then
  deployed_commit="$(tr -d '[:space:]' <"$MARKER_FILE")"
fi

if [[ "$current_commit" != "$remote_commit" ]]; then
  log "Neuer Commit: ${current_commit:0:8} → ${remote_commit:0:8}"
  # Absichtlich kein reset --hard: lokale Serveränderungen sollen nie
  # unbemerkt vernichtet werden. In dem Fall erscheint ein klarer Fehler im
  # Journal und der laufende Prozess bleibt unangetastet.
  git merge --ff-only "$remote_commit"
  current_commit="$(git rev-parse HEAD)"
fi

if [[ "$deployed_commit" == "$current_commit" ]]; then
  # Normalfall (59 von 60 Timer-Läufen): bewusst keine Journal-Zeile.
  exit 0
fi

# Dependencies nur bei tatsächlicher Manifest-Änderung aktualisieren. Beim
# allerersten Timer-Lauf ist kein Marker vorhanden: `npm install` stellt einen
# reproduzierbaren Ausgangszustand her. --legacy-peer-deps ist nötig, weil das
# bestehende Projekt bewusst Vite-Peerbereiche überschneidet (npm ci ohne Flag
# scheitert mit ERESOLVE; pnpm ist auf dem VPS nicht garantiert). `npm ci`
# verändert das Lockfile nicht — wichtig, damit der nächste Fast-forward nicht
# an einer vom Server erzeugten Arbeitskopie scheitert.
dependencies_changed=1
if [[ -n "$deployed_commit" ]] && git cat-file -e "$deployed_commit^{commit}" 2>/dev/null; then
  if git diff --quiet "$deployed_commit" "$current_commit" -- \
    package.json package-lock.json; then
    dependencies_changed=0
  fi
fi

if [[ "$dependencies_changed" -eq 1 ]]; then
  log "Paketmanifest geändert — installiere Dependencies …"
  npm ci --legacy-peer-deps
fi

log "Baue Commit ${current_commit:0:8} …"
npm run build

log "Starte PM2-Prozess '$PROCESS_NAME' neu …"
pm2 restart "$PROCESS_NAME" --update-env
pm2 save --force >/dev/null

# Atomarer Marker: nie einen halben/leer geschriebenen Status hinterlassen.
marker_tmp="$MARKER_FILE.tmp"
printf '%s\n' "$current_commit" >"$marker_tmp"
mv "$marker_tmp" "$MARKER_FILE"

log "DEPLOY-OK ${current_commit:0:8}"
