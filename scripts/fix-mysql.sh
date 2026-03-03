#!/bin/bash
# MySQL Fix für Ubuntu 24.04

echo "🔧 MySQL wird für Pageblitz konfiguriert..."

# Variante 1: Direkt über Socket als System-Root
sudo mysql -u root << 'EOF'
-- Root-Passwort setzen
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'RootPass123!';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Root-Passwort gesetzt"
else
    echo "⚠️  Konnte Root-Passwort nicht setzen, versuche alternative Methode..."
fi

# Variante 2: Falls Socket-Auth nicht funktioniert, Secure Installation
sudo mysql_secure_installation << 'SECURE'
n
RootPass123!
RootPass123!
y
y
y
y
SECURE

# Datenbank und User erstellen (jetzt sollte es funktionieren)
sudo mysql -u root -pRootPass123! << 'EOF' 2>/dev/null || sudo mysql -u root << 'EOF'
-- Datenbank erstellen
CREATE DATABASE IF NOT EXISTS pageblitz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- User erstellen (falls nicht existiert)
CREATE USER IF NOT EXISTS 'pageblitz'@'localhost' IDENTIFIED BY 'PageblitzDB123!';

-- Rechte vergeben
GRANT ALL PRIVILEGES ON pageblitz.* TO 'pageblitz'@'localhost';
FLUSH PRIVILEGES;

-- Erfolg bestätigen
SELECT 'Datenbank und User erfolgreich erstellt' AS status;
EOF

echo ""
echo "✅ MySQL Konfiguration abgeschlossen"
echo ""
echo "📊 Datenbank-Info:"
echo "   Datenbank: pageblitz"
echo "   User: pageblitz"
echo "   Passwort: PageblitzDB123!"
echo ""
echo "🔗 Connection String:"
echo "   mysql://pageblitz:PageblitzDB123!@localhost:3306/pageblitz"
