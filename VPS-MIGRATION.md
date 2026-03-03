# Pageblitz VPS Migration Guide

## 🎯 Ziel
Umzug von Manus-Servern auf eigenen VPS zur Kosteneinsparung.

## 📋 Checkliste

### Phase 1: VPS vorbereiten
- [ ] VPS bei Hetzner/Contabo/Netcup bestellen (4GB RAM, 2 Cores, 50GB)
- [ ] Ubuntu 22.04 LTS installieren
- [ ] SSH-Zugang konfigurieren
- [ ] Firewall (ufw) aktivieren: Ports 22, 80, 443, 3000

### Phase 2: Software installieren
```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL Server
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Prozess-Management
sudo npm install -g pm2

# Reverse Proxy
sudo apt install -y nginx

# Weitere Tools
sudo apt install -y git curl vim
```

### Phase 3: MySQL einrichten
```bash
# MySQL root-Passwort setzen
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'DEIN_SICHERES_PASSWORT';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Datenbank und User erstellen
sudo mysql -u root -p <<EOF
CREATE DATABASE pageblitz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pageblitz'@'localhost' IDENTIFIED BY 'SICHERES_DB_PASSWORT';
GRANT ALL PRIVILEGES ON pageblitz.* TO 'pageblitz'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### Phase 4: Datenbank migrieren

**Option A: Export/Import (empfohlen)**
```bash
# Auf Manus-Server (alte Umgebung):
mysqldump -u username -p pageblitz > pageblitz_backup.sql

# Datei auf VPS übertragen (lokal):
scp pageblitz_backup.sql root@DEINE_VPS_IP:/root/

# Auf VPS importieren:
mysql -u pageblitz -p pageblitz < /root/pageblitz_backup.sql
```

**Option B: Drizzle Migration (falls Struktur ändert)**
```bash
# Nach dem Deployment auf VPS:
npm run db:push
```

### Phase 5: Applikation deployen

```bash
# Auf VPS als root:

# 1. Ordner erstellen
mkdir -p /var/www/pageblitz
cd /var/www/pageblitz

# 2. Code vom GitHub-Repo clonen
git clone https://github.com/chistianslater/pageblitz.git .

# 3. Dependencies installieren
npm install

# 4. Environment-Variablen setzen
cp .env.example .env
nano .env  # Hier alle Werte anpassen!

# WICHTIGE ÄNDERUNGEN in .env:
# DATABASE_URL=mysql://pageblitz:SICHERES_DB_PASSWORT@localhost:3306/pageblitz
# VITE_APP_ID=https://deine-domain.de
# NODE_ENV=production

# 5. Build erstellen
npm run build

# 6. Mit PM2 starten
pm2 start dist/index.js --name pageblitz
pm2 save
pm2 startup
```

### Phase 6: Nginx konfigurieren

```bash
sudo nano /etc/nginx/sites-available/pageblitz
```

Inhalt:
```nginx
server {
    listen 80;
    server_name deine-domain.de www.deine-domain.de;

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
    }
}
```

```bash
# Konfiguration aktivieren
sudo ln -s /etc/nginx/sites-available/pageblitz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL-Zertifikat mit Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d deine-domain.de -d www.deine-domain.de
```

### Phase 7: DNS umstellen
- [ ] A-Record auf VPS-IP zeigen lassen
- [ ] TTL vorher senken (1 Stunde vor Migration)
- [ ] Nach Migration warten bis DNS propagiert (max 24h)

### Phase 8: Testen
- [ ] Website aufrufbar?
- [ ] Login funktioniert?
- [ ] Datenbank-Verbindung ok?
- [ ] E-Mails werden versendet?
- [ ] Stripe-Zahlungen funktionieren?

## 🔧 Wichtige .env-Variablen für VPS

```bash
# Datenbank (jetzt lokale MySQL)
DATABASE_URL=mysql://pageblitz:DEIN_DB_PASSWORT@localhost:3306/pageblitz

# App-URL (deine neue Domain)
VITE_APP_ID=https://pageblitz.de

# Secrets (neu generieren!)
JWT_SECRET=ein-neuer-zufälliger-string-mindestens-32-zeichen

# Externe Services (bleiben gleich)
RESEND_API_KEY=re_... (von Resend)
STRIPE_SECRET_KEY=sk_live_... (von Stripe)
BUILT_IN_FORGE_API_KEY=... (Für KI-Generierung)
```

## 💰 Kosteneinsparung

| Kostenart | Manus | VPS (z.B. Hetzner) |
|-----------|-------|-------------------|
| Server | ~$50-100/Monat | ~$8-15/Monat |
| Tokens | ~$20-50/Monat | Gleich (API-Kosten) |
| **Gesamt** | **~$70-150/Monat** | **~$8-15/Monat** |

**Einsparung: ~80-90%**

## 🆘 Troubleshooting

**Problem: MySQL Verbindung fehlschlägt**
```bash
# Prüfen ob MySQL läuft
sudo systemctl status mysql

# Firewall-Regel prüfen
sudo ufw status

# MySQL User-Rechte checken
sudo mysql -u root -p -e "SELECT User, Host FROM mysql.user;"
```

**Problem: PM2 Prozess stürzt ab**
```bash
# Logs anzeigen
pm2 logs pageblitz

# Neustarten
pm2 restart pageblitz
```

**Problem: 502 Bad Gateway**
```bash
# Prüfen ob App auf Port 3002 läuft
sudo netstat -tulpn | grep 3002

# Nginx Fehler-Logs
sudo tail -f /var/log/nginx/error.log
```

## 📞 Support

Solltest du bei der Migration Probleme haben:
1. Logs prüfen: `pm2 logs`, `sudo journalctl -u nginx`
2. .env-Variablen verifizieren
3. Datenbank-Verbindung testen: `mysql -u pageblitz -p -e "SHOW TABLES;"`
