#!/bin/bash

# Pageblitz VPS Deployment Script
# Usage: ./scripts/deploy.sh

set -e  # Exit on error

echo "🚀 Pageblitz VPS Deployment"
echo "=========================="

# Konfiguration
APP_NAME="pageblitz"
APP_DIR="/var/www/pageblitz"
GIT_REPO="https://github.com/chistianslater/pageblitz.git"
NODE_VERSION="20"
PM2_NAME="pageblitz"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Prüfen ob als root ausgeführt
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Dieses Script muss als root ausgeführt werden${NC}"
   echo "Bitte ausführen: sudo ./scripts/deploy.sh"
   exit 1
fi

# Funktionen
print_step() {
    echo -e "${YELLOW}\n📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. System-Updates
print_step "1/10: System-Updates installieren..."
apt update && apt upgrade -y
print_success "System aktualisiert"

# 2. Node.js installieren
print_step "2/10: Node.js $NODE_VERSION installieren..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
    print_success "Node.js installiert"
else
    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT" != "$NODE_VERSION" ]; then
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt install -y nodejs
        print_success "Node.js aktualisiert"
    else
        print_success "Node.js bereits auf Version $NODE_VERSION"
    fi
fi

# 3. MySQL installieren
print_step "3/10: MySQL Server installieren..."
if ! command -v mysql &> /dev/null; then
    apt install -y mysql-server
    
    # MySQL sichern
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root123';" || true
    mysql -e "FLUSH PRIVILEGES;"
    
    # Datenbank und User erstellen
    mysql -u root -proot123 <<EOF || true
CREATE DATABASE IF NOT EXISTS pageblitz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'pageblitz'@'localhost' IDENTIFIED BY 'pageblitz123';
GRANT ALL PRIVILEGES ON pageblitz.* TO 'pageblitz'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    print_success "MySQL installiert und konfiguriert"
    print_success "Datenbank: pageblitz"
    print_success "User: pageblitz / Passwort: pageblitz123"
else
    print_success "MySQL bereits installiert"
fi

# 4. PM2 installieren
print_step "4/10: PM2 (Process Manager) installieren..."
npm install -g pm2
print_success "PM2 installiert"

# 5. Nginx installieren
print_step "5/10: Nginx installieren..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    print_success "Nginx installiert"
else
    print_success "Nginx bereits installiert"
fi

# 6. Git installieren
print_step "6/10: Git installieren..."
if ! command -v git &> /dev/null; then
    apt install -y git
    print_success "Git installiert"
else
    print_success "Git bereits installiert"
fi

# 7. Firewall konfigurieren
print_step "7/10: Firewall konfigurieren..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3002/tcp
ufw --force enable
print_success "Firewall aktiviert (Ports: 22, 80, 443, 3002)"

# 8. Applikation deployen
print_step "8/10: Pageblitz Applikation deployen..."

# Verzeichnis erstellen
mkdir -p $APP_DIR
cd $APP_DIR

# Git Repository clonen (falls nicht vorhanden)
if [ ! -d ".git" ]; then
    git clone $GIT_REPO .
    print_success "Repository geklont"
else
    git pull origin main
    print_success "Repository aktualisiert"
fi

# Dependencies installieren
npm install
print_success "Node.js Dependencies installiert"

# Build erstellen
npm run build
print_success "Build erstellt"

print_success "Applikation deployed nach $APP_DIR"

# 9. PM2 Prozess starten
print_step "9/10: PM2 Prozess konfigurieren..."

# Existierenden Prozess stoppen (falls vorhanden)
pm2 stop $PM2_NAME 2>/dev/null || true
pm2 delete $PM2_NAME 2>/dev/null || true

# Neuen Prozess starten
cd $APP_DIR
pm2 start dist/index.js --name $PM2_NAME \
    --max-memory-restart 1G \
    --restart-delay 3000 \
    --max-restarts 5 \
    --min-uptime 10s

pm2 save
pm2 startup systemd -u root --hp /root

print_success "PM2 Prozess gestartet"

# 10. Nginx konfigurieren
print_step "10/10: Nginx als Reverse Proxy konfigurieren..."

cat > /etc/nginx/sites-available/pageblitz << 'EOF'
server {
    listen 80;
    server_name _;  # Akzeptiert alle Domains

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Site aktivieren
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/pageblitz /etc/nginx/sites-enabled/

# Nginx testen und neustarten
nginx -t
systemctl restart nginx

print_success "Nginx konfiguriert"

# Zusammenfassung
echo ""
echo -e "${GREEN}🎉 Deployment erfolgreich!${NC}"
echo "=========================="
echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "🌐 Zugriff:"
echo "   - HTTP: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "⚙️  Nächste Schritte:"
echo "   1. .env Datei anpassen: nano $APP_DIR/.env"
echo "   2. Datenbank migrieren (falls nötig)"
echo "   3. SSL-Zertifikat einrichten: certbot --nginx"
echo "   4. DNS A-Record auf $(hostname -I | awk '{print $1}') zeigen lassen"
echo ""
echo "🔧 Wichtige Befehle:"
echo "   - Logs anzeigen: pm2 logs pageblitz"
echo "   - Neustarten: pm2 restart pageblitz"
echo "   - Status: pm2 status"
echo ""

# Hinweis auf .env
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  WICHTIG: .env Datei erstellen!${NC}"
    echo "   cp $APP_DIR/.env.example $APP_DIR/.env"
    echo "   nano $APP_DIR/.env"
    echo ""
fi

exit 0
