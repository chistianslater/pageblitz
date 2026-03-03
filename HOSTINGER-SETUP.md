# Pageblitz auf Hostinger VPS installieren

## 🎯 Voraussetzungen

- Hostinger VPS mit Ubuntu 24.04 LTS
- Root-Zugang via SSH
- Domain (optional, aber empfohlen)
- Ca. 30-45 Minuten Zeit

---

## 📋 Schritt 1: SSH-Verbindung herstellen

### 1.1 Terminal öffnen (auf deinem Mac)

```bash
# SSH auf Hostinger VPS verbinden
# Ersetze DEINE_IP mit der IP-Adresse deines Hostinger VPS
ssh root@DEINE_IP
```

**Beispiel:**
```bash
ssh root@185.224.137.42
```

### 1.2 Erster Login

Wenn gefragt: `yes` eingeben (für Fingerprint-Bestätigung)

Passwort eingeben (von Hostinger bereitgestellt oder per E-Mail erhalten)

---

## 📋 Schritt 2: System vorbereiten (5 Minuten)

Sobald du eingeloggt bist, führe diese Befehle aus:

```bash
# System aktualisieren
apt update && apt upgrade -y

# Grundlegende Tools installieren
apt install -y curl wget git vim nano ufw

# Zeitzone setzen (optional, aber empfohlen)
timedatectl set-timezone Europe/Berlin
```

**Warte bis die Installationen abgeschlossen sind** (fortschreitende Punkte zeigen den Fortschritt)

---

## 📋 Schritt 3: Node.js installieren (2 Minuten)

```bash
# Node.js 20 LTS Repository hinzufügen
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Node.js installieren
apt install -y nodejs

# Installation prüfen
node --version
npm --version
```

**Erwartete Ausgabe:**
```
v20.18.0
10.8.2
```

---

## 📋 Schritt 4: MySQL Datenbank installieren (3 Minuten)

```bash
# MySQL Server installieren
apt install -y mysql-server

# MySQL starten und aktivieren
systemctl start mysql
systemctl enable mysql

# MySQL sicher konfigurieren
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'RootPass123!';"
mysql -e "FLUSH PRIVILEGES;"

# Datenbank und User erstellen
mysql -u root -pRootPass123! <<EOF
CREATE DATABASE IF NOT EXISTS pageblitz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'pageblitz'@'localhost' IDENTIFIED BY 'PageblitzDB123!';
GRANT ALL PRIVILEGES ON pageblitz.* TO 'pageblitz'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✅ MySQL eingerichtet"
echo "   Datenbank: pageblitz"
echo "   User: pageblitz"
echo "   Passwort: PageblitzDB123!"
```

---

## 📋 Schritt 5: Firewall konfigurieren (2 Minuten)

```bash
# Firewall aktivieren
ufw default deny incoming
ufw default allow outgoing

# Notwendige Ports öffnen
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3002/tcp  # Pageblitz App

# Firewall aktivieren
ufw --force enable

# Status prüfen
ufw status
```

---

## 📋 Schritt 6: PM2 und Nginx installieren (2 Minuten)

```bash
# PM2 (Process Manager) global installieren
npm install -g pm2

# Nginx installieren
apt install -y nginx

# Nginx starten und aktivieren
systemctl start nginx
systemctl enable nginx

# Installation prüfen
pm2 --version
nginx -v
```

---

## 📋 Schritt 7: Pageblitz Code deployen (5 Minuten)

```bash
# Ordner erstellen
mkdir -p /var/www/pageblitz
cd /var/www/pageblitz

# Git Repository clonen
git clone https://github.com/chistianslater/pageblitz.git .

# Dependencies installieren (dauert 2-3 Minuten)
npm install

# Erfolg prüfen
if [ $? -eq 0 ]; then
    echo "✅ Dependencies erfolgreich installiert"
else
    echo "❌ Fehler bei npm install"
    exit 1
fi
```

---

## 📋 Schritt 8: Environment-Variablen konfigurieren (5 Minuten)

```bash
# In das Pageblitz-Verzeichnis wechseln
cd /var/www/pageblitz

# .env.example kopieren
cp .env.example .env

# .env Datei mit nano öffnen
nano .env
```

### Wichtige Änderungen in der .env Datei:

```bash
# DATENBANK (hier die MySQL-Daten von Schritt 4 eintragen)
DATABASE_URL=mysql://pageblitz:PageblitzDB123!@localhost:3306/pageblitz

# APP URL (deine Domain oder IP)
VITE_APP_ID=http://DEINE_VPS_IP:3002
# ODER mit Domain:
# VITE_APP_ID=https://deine-domain.de

# SECRETS (neu generieren!)
JWT_SECRET=dein-super-langes-zufälliges-passwort-mindestens-32-zeichen

# EXTERNE SERVICES (von deinem aktuellen .env übernehmen!)
RESEND_API_KEY=re_...         # ← Aus deinem aktuellen Manus-Projekt kopieren
STRIPE_SECRET_KEY=sk_...      # ← Aus deinem aktuellen Manus-Projekt kopieren
BUILT_IN_FORGE_API_KEY=...    # ← Aus deinem aktuellen Manus-Projekt kopieren
GOOGLE_PLACES_API_KEY=...     # ← Aus deinem aktuellen Manus-Projekt kopieren
```

**Speichern in nano:**
1. `Ctrl + O` drücken (zum Speichern)
2. `Enter` drücken (bestätigen)
3. `Ctrl + X` drücken (nano beenden)

---

## 📋 Schritt 9: Build erstellen (3 Minuten)

```bash
cd /var/www/pageblitz

# TypeScript prüfen
npm run check

# Build erstellen (dauert ca. 2-3 Minuten)
npm run build

echo "✅ Build erfolgreich erstellt"
```

---

## 📋 Schritt 10: Pageblitz mit PM2 starten (2 Minuten)

```bash
cd /var/www/pageblitz

# PM2 Prozess starten
pm2 start dist/index.js --name pageblitz

# PM2 konfigurieren (automatischer Start nach Reboot)
pm2 save
pm2 startup systemd

# Der Befehl gibt eine Befehlszeile aus - diese kopieren und ausführen!
# Zum Beispiel:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root

# Status prüfen
pm2 status
pm2 logs pageblitz --lines 20
```

**Wichtig:** Die `pm2 startup` Ausgabe enthält einen Befehl, den du **kopieren und ausführen** musst!

---

## 📋 Schritt 11: Nginx als Reverse Proxy einrichten (3 Minuten)

```bash
# Nginx Konfiguration erstellen
nano /etc/nginx/sites-available/pageblitz
```

### Folgenden Inhalt einfügen:

```nginx
server {
    listen 80;
    server_name _;  # Akzeptiert alle Anfragen (IP oder Domain)

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts erhöhen
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Speichern:** `Ctrl + O`, `Enter`, `Ctrl + X`

### Konfiguration aktivieren:

```bash
# Default Site entfernen
rm -f /etc/nginx/sites-enabled/default

# Neue Site aktivieren
ln -s /etc/nginx/sites-available/pageblitz /etc/nginx/sites-enabled/

# Nginx Konfiguration testen
nginx -t

# Nginx neustarten
systemctl restart nginx

echo "✅ Nginx konfiguriert"
```

---

## 📋 Schritt 12: SSL-Zertifikat einrichten (optional, 3 Minuten)

**Nur wenn du eine Domain hast!**

```bash
# Certbot installieren
apt install -y certbot python3-certbot-nginx

# SSL-Zertifikat beantragen (ersetze deine-domain.de)
certbot --nginx -d deine-domain.de --non-interactive --agree-tos --email deine-email@domain.de

# Auto-Renewal testen
certbot renew --dry-run

echo "✅ SSL eingerichtet"
echo "🌐 Deine Seite ist jetzt unter https://deine-domain.de erreichbar"
```

---

## 📋 Schritt 13: Testen

### 13.1 Überprüfe ob alles läuft:

```bash
# PM2 Status
pm2 status

# Nginx Status
systemctl status nginx

# MySQL Status
systemctl status mysql

# Ports prüfen
netstat -tulpn | grep -E "(3002|80|443)"
```

### 13.2 Im Browser testen:

Öffne deinen Browser und gehe zu:
```
http://DEINE_VPS_IP
```

Oder mit Domain:
```
https://deine-domain.de
```

---

## 📋 Schritt 14: Datenbank migrieren (falls nötig)

Wenn du Daten von Manus übernehmen willst:

### 14.1 Auf Manus-Server (alte Umgebung):

```bash
# In deinem aktuellen Manus-Projekt:
mysqldump -u USERNAME -p DATENBANKNAME > pageblitz_backup.sql

# Falls du keinen direkten Datenbankzugang hast, frage in Manus:
# "Wie exportiere ich die MySQL Datenbank?"
```

### 14.2 Backup auf neuen VPS übertragen:

```bash
# Lokal auf deinem Mac:
scp pageblitz_backup.sql root@DEINE_VPS_IP:/root/

# Dann auf dem VPS:
ssh root@DEINE_VPS_IP
mysql -u pageblitz -pPageblitzDB123! pageblitz < /root/pageblitz_backup.sql
```

---

## ✅ Fertig! Dein Pageblitz läuft jetzt auf Hostinger!

### Wichtige Informationen:

| Komponente | Details |
|------------|---------|
| **App URL** | http://DEINE_VPS_IP oder https://deine-domain.de |
| **Datenbank** | pageblitz (User: pageblitz, Pass: PageblitzDB123!) |
| **MySQL Root** | RootPass123! |
| **App Port** | 3002 (intern) |
| **Log-Dateien** | `/root/.pm2/logs/` |

### Nützliche Befehle für die Zukunft:

```bash
# App neustarten
pm2 restart pageblitz

# Logs anzeigen
pm2 logs pageblitz

# Status prüfen
pm2 status

# Systemdienste prüfen
systemctl status nginx
systemctl status mysql

# Backup erstellen
cd /var/www/pageblitz && ./scripts/backup.sh

# Updates einspielen
cd /var/www/pageblitz && ./scripts/update.sh
```

---

## 🆘 Troubleshooting

### Problem: "Cannot connect to MySQL"
```bash
# MySQL Status prüfen
systemctl status mysql

# MySQL manuell starten
systemctl start mysql

# Datenbank-User Rechte prüfen
mysql -u root -pRootPass123! -e "SELECT User, Host FROM mysql.user;"
```

### Problem: "502 Bad Gateway"
```bash
# Prüfen ob Pageblitz läuft
pm2 status

# Pageblitz Logs prüfen
pm2 logs pageblitz --lines 50

# Port belegung prüfen
netstat -tulpn | grep 3002
```

### Problem: "Permission denied"
```bash
# Alle Befehle müssen als root ausgeführt werden!
sudo su  # Oder stelle sicher, dass du als root eingeloggt bist
```

---

## 💰 Kostenvergleich

| | Manus | Hostinger VPS |
|---|---|---|
| **Server** | ~$50-100/Monat | ~€6-12/Monat |
| **Einsparung** | - | **~80-90%** |

Du sparst also ca. €40-80 pro Monat!

---

**🎉 Glückwunsch! Dein Pageblitz läuft jetzt auf deinem eigenen VPS!**

Bei Problemen schicke mir:
1. Die Fehlermeldung
2. Die Ausgabe von `pm2 logs pageblitz`
3. Die Ausgabe von `systemctl status nginx`
