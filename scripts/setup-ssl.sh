#!/bin/bash

# Pageblitz SSL Setup Script
# Richtet Let's Encrypt SSL-Zertifikat ein

set -e

echo "🔒 Pageblitz SSL Setup"
echo "====================="

# Prüfen ob Domain angegeben wurde
if [ -z "$1" ]; then
    echo "❌ Fehler: Keine Domain angegeben"
    echo ""
    echo "Verwendung:"
    echo "  sudo ./scripts/setup-ssl.sh deine-domain.de"
    echo "  sudo ./scripts/setup-ssl.sh deine-domain.de www.deine-domain.de"
    exit 1
fi

DOMAIN=$1

echo "Domain: $DOMAIN"

# Certbot installieren
if ! command -v certbot &> /dev/null; then
    echo "📦 Certbot wird installiert..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Nginx-Konfiguration für Domain anpassen
echo "📝 Nginx-Konfiguration wird angepasst..."
sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/sites-available/pageblitz
nginx -t && systemctl reload nginx

# SSL-Zertifikat beantragen
echo "🔐 Let's Encrypt Zertifikat wird beantragt..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Auto-Renewal testen
echo "🔄 Auto-Renewal wird getestet..."
certbot renew --dry-run

echo ""
echo "✅ SSL erfolgreich eingerichtet!"
echo ""
echo "🌐 Deine Website ist jetzt erreichbar unter:"
echo "   https://$DOMAIN"
echo ""
echo "📅 Zertifikat läuft ab in 90 Tagen und wird automatisch erneuert."

exit 0
