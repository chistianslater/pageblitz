#!/usr/bin/env bash
#
# Einmalige Installation des Pageblitz-Auto-Deploys auf dem VPS.
# Ausführen als root:
#   cd /root/pageblitz && git pull && bash scripts/install-auto-deploy.sh
#
# Danach prüft der VPS origin/main einmal pro Minute selbst. Status:
#   systemctl status pageblitz-auto-deploy.timer
#   journalctl -u pageblitz-auto-deploy.service -n 100 --no-pager

set -Eeuo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  printf 'Bitte als root ausführen (hPanel-Terminal ist bereits root).\n' >&2
  exit 1
fi

REPO_DIR="${PAGEBLITZ_REPO_DIR:-/root/pageblitz}"
SERVICE_FILE="/etc/systemd/system/pageblitz-auto-deploy.service"
TIMER_FILE="/etc/systemd/system/pageblitz-auto-deploy.timer"

if [[ ! -x "$REPO_DIR/scripts/auto-deploy.sh" ]]; then
  chmod +x "$REPO_DIR/scripts/auto-deploy.sh"
fi

cat >"$SERVICE_FILE" <<EOF
[Unit]
Description=Pageblitz automatisch von origin/main deployen
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
WorkingDirectory=$REPO_DIR
Environment=PAGEBLITZ_REPO_DIR=$REPO_DIR
Environment=PAGEBLITZ_PM2_PROCESS=pageblitz
ExecStart=/bin/bash $REPO_DIR/scripts/auto-deploy.sh
TimeoutStartSec=20min

# Build braucht Schreibzugriff auf dist/ und den Deploy-Marker. Der Prozess
# läuft auf diesem VPS bereits unter root (hPanel-/PM2-Setup); daher bewusst
# derselbe User statt eines neuen Accounts mit unklaren Dateirechten.
User=root
Group=root

[Install]
WantedBy=multi-user.target
EOF

cat >"$TIMER_FILE" <<'EOF'
[Unit]
Description=Pageblitz Auto-Deploy jede Minute prüfen

[Timer]
OnBootSec=45s
OnUnitActiveSec=60s
AccuracySec=10s
Persistent=true
Unit=pageblitz-auto-deploy.service

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now pageblitz-auto-deploy.timer

# Nicht bis zum ersten Timer-Tick warten: einmal direkt ausführen. Der Aufruf
# blockiert bis Build/Restart fertig sind und gibt bei Fehlern einen Exit-Code
# zurück — der Nutzer sieht sofort, ob die Einrichtung funktioniert.
systemctl start pageblitz-auto-deploy.service

printf '\nAuto-Deploy ist aktiv.\n'
printf 'Timer:  systemctl status pageblitz-auto-deploy.timer --no-pager\n'
printf 'Logs:   journalctl -u pageblitz-auto-deploy.service -n 100 --no-pager\n'
