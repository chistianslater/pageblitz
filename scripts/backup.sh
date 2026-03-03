#!/bin/bash

# Pageblitz Backup Script
# Erstellt ein vollständiges Backup der Datenbank und Konfiguration

set -e

# Konfiguration
BACKUP_DIR="/var/backups/pageblitz"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="pageblitz"
DB_USER="pageblitz"
APP_DIR="/var/www/pageblitz"
RETENTION_DAYS=7

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}💾 Pageblitz Backup wird erstellt...${NC}"

# Backup-Verzeichnis erstellen
mkdir -p $BACKUP_DIR

# 1. Datenbank-Backup
echo "📦 Datenbank wird gesichert..."
mysqldump -u $DB_USER -p'pageblitz123' $DB_NAME | gzip > $BACKUP_DIR/db_${DATE}.sql.gz

# 2. .env Backup (wichtig für Secrets)
echo "🔐 Konfiguration wird gesichert..."
if [ -f "$APP_DIR/.env" ]; then
    cp $APP_DIR/.env $BACKUP_DIR/env_${DATE}.backup
fi

# 3. Uploads/Dateien (falls vorhanden)
echo "📁 Dateien werden gesichert..."
if [ -d "$APP_DIR/uploads" ]; then
    tar -czf $BACKUP_DIR/uploads_${DATE}.tar.gz -C $APP_DIR uploads 2>/dev/null || true
fi

# 4. Alte Backups löschen (älter als RETENTION_DAYS)
echo "🗑️  Alte Backups werden bereinigt..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.backup" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# Zusammenfassung
echo -e "${GREEN}✅ Backup erfolgreich erstellt!${NC}"
echo ""
echo "📂 Backup-Dateien:"
ls -lh $BACKUP_DIR/*${DATE}* 2>/dev/null || echo "   Keine Dateien gefunden"
echo ""
echo "📁 Backup-Verzeichnis: $BACKUP_DIR"
echo "🕐 Erstellt am: $(date)"
echo "📊 Gesamtgröße: $(du -sh $BACKUP_DIR | cut -f1)"

exit 0
