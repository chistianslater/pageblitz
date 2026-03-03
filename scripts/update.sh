#!/bin/bash

# Pageblitz Update Script
# Aktualisiert die Applikation auf die neueste Version

set -e

APP_DIR="/var/www/pageblitz"
PM2_NAME="pageblitz"

echo "🔄 Pageblitz Update"
echo "=================="

# Prüfen ob als root ausgeführt
if [[ $EUID -ne 0 ]]; then
   echo "❌ Dieses Script muss als root ausgeführt werden"
   exit 1
fi

cd $APP_DIR

# 1. Backup erstellen
echo "💾 Backup wird erstellt..."
if [ -f "./scripts/backup.sh" ]; then
    ./scripts/backup.sh
fi

# 2. Aktuellen Stand speichern
echo "📦 Aktuellen Stand sichern..."
git stash

# 3. Code aktualisieren
echo "⬇️  Code wird aktualisiert..."
git pull origin main

# 4. Dependencies aktualisieren
echo "📦 Dependencies werden aktualisiert..."
npm install

# 5. Build erstellen
echo "🔨 Build wird erstellt..."
npm run build

# 6. Datenbank-Migration (falls nötig)
echo "🗄️  Datenbank wird aktualisiert..."
npm run db:push || echo "⚠️  Datenbank-Migration übersprungen"

# 7. PM2 neustarten
echo "🚀 Applikation wird neugestartet..."
pm2 restart $PM2_NAME

# 8. Status prüfen
echo "📊 Status wird geprüft..."
sleep 2
pm2 status

echo ""
echo "✅ Update erfolgreich!"
echo ""
echo "🔧 Logs anzeigen: pm2 logs pageblitz"

exit 0
