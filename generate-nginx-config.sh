#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Nginx Config Generator for Glitter Tattoo Static Site
# Supports Cloudflare SSL Flexible (port 80) and Full (port 443)
# ============================================================

DOMAIN=""
DOMAIN_ALT=""
UPSTREAM_PORT=3004
OUT_DIR="$(cd "$(dirname "$0")" && pwd)/out"
OUTPUT_FILE=""
SSL_MODE=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

usage() {
  echo ""
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Generate nginx config for Glitter Tattoo static site"
  echo ""
  echo "Options:"
  echo "  -m, --mode MODE       SSL mode: 'flexible' (port 80) or 'full' (port 443)"
  echo "  -d, --domain DOMAIN   Primary domain (will prompt if not set)"
  echo "  -p, --port PORT       Upstream app port (default: $UPSTREAM_PORT)"
  echo "  -o, --output FILE     Output file path (default: stdout)"
  echo "  -r, --root DIR        Static files root directory (default: $OUT_DIR)"
  echo "  --alt DOMAIN          Alternate domain to redirect (e.g. www.example.com)"
  echo "  --no-alt              Skip alternate domain redirect"
  echo "  --cert PATH           SSL certificate path (required for 'full' mode)"
  echo "  --key PATH            SSL private key path (required for 'full' mode)"
  echo "  -h, --help            Show this help"
  echo ""
  echo "Examples:"
  echo "  $0 -m flexible"
  echo "  $0 -m full --cert /etc/ssl/certs/glitter-tattoo.pem --key /etc/ssl/private/glitter-tattoo.key"
  echo "  $0 -m flexible -o /etc/nginx/sites-available/glitter-tattoo.conf"
  echo ""
}

SSL_CERT=""
SSL_KEY=""
NO_ALT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -m|--mode)    SSL_MODE="$2"; shift 2 ;;
    -d|--domain)  DOMAIN="$2"; shift 2 ;;
    --alt)        DOMAIN_ALT="$2"; shift 2 ;;
    --no-alt)     NO_ALT=true; DOMAIN_ALT="__none__"; shift ;;
    -p|--port)    UPSTREAM_PORT="$2"; shift 2 ;;
    -o|--output)  OUTPUT_FILE="$2"; shift 2 ;;
    -r|--root)    OUT_DIR="$2"; shift 2 ;;
    --cert)       SSL_CERT="$2"; shift 2 ;;
    --key)        SSL_KEY="$2"; shift 2 ;;
    -h|--help)    usage; exit 0 ;;
    *)            echo -e "${RED}Unknown option: $1${NC}"; usage; exit 1 ;;
  esac
done

# Clear sentinel value
if [[ "$DOMAIN_ALT" == "__none__" ]]; then
  DOMAIN_ALT=""
fi

# Validate domain
if [[ -z "$DOMAIN" ]]; then
  read -rp "$(echo -e "${YELLOW}Enter domain (e.g. glitter-tattoo.com):${NC} ")" DOMAIN
  if [[ -z "$DOMAIN" ]]; then
    echo -e "${RED}Error: domain is required${NC}"
    exit 1
  fi
fi

# Ask about alternate domain (www ↔ non-www redirect)
if [[ -z "$DOMAIN_ALT" && "$NO_ALT" == false ]]; then
  if [[ "$DOMAIN" == www.* ]]; then
    default_alt="${DOMAIN#www.}"
  else
    default_alt="www.${DOMAIN}"
  fi
  read -rp "$(echo -e "${YELLOW}Redirect alternate domain? [${default_alt}] (enter to use, 'n' to skip):${NC} ")" alt_input
  if [[ "$alt_input" == "n" || "$alt_input" == "N" ]]; then
    DOMAIN_ALT=""
  elif [[ -n "$alt_input" ]]; then
    DOMAIN_ALT="$alt_input"
  else
    DOMAIN_ALT="$default_alt"
  fi
fi

if [[ -n "$DOMAIN_ALT" ]]; then
  echo -e "${GREEN}Domain: ${DOMAIN} (redirect: ${DOMAIN_ALT} → ${DOMAIN})${NC}" >&2
else
  echo -e "${GREEN}Domain: ${DOMAIN} (no alternate redirect)${NC}" >&2
fi
echo "" >&2

# Validate mode
if [[ -z "$SSL_MODE" ]]; then
  echo -e "${YELLOW}Select Cloudflare SSL mode:${NC}"
  echo "  1) Flexible  - Cloudflare → HTTP (port 80) → your server"
  echo "  2) Full      - Cloudflare → HTTPS (port 443) → your server"
  echo ""
  read -rp "Enter choice [1/2]: " choice
  case $choice in
    1) SSL_MODE="flexible" ;;
    2) SSL_MODE="full" ;;
    *) echo -e "${RED}Invalid choice${NC}"; exit 1 ;;
  esac
fi

SSL_MODE=$(echo "$SSL_MODE" | tr '[:upper:]' '[:lower:]')

if [[ "$SSL_MODE" != "flexible" && "$SSL_MODE" != "full" ]]; then
  echo -e "${RED}Error: mode must be 'flexible' or 'full'${NC}"
  exit 1
fi

# Capitalize mode name for display
if [[ "$SSL_MODE" == "flexible" ]]; then
  SSL_MODE_LABEL="Flexible"
else
  SSL_MODE_LABEL="Full"
fi

# Validate SSL cert/key for full mode
if [[ "$SSL_MODE" == "full" ]]; then
  if [[ -z "$SSL_CERT" || -z "$SSL_KEY" ]]; then
    echo -e "${YELLOW}Full mode requires SSL certificate and key.${NC}"
    echo "You can use Cloudflare Origin Certificate (free) or Let's Encrypt."
    echo ""
    read -rp "SSL certificate path: " SSL_CERT
    read -rp "SSL private key path: " SSL_KEY
  fi
  if [[ -z "$SSL_CERT" || -z "$SSL_KEY" ]]; then
    echo -e "${RED}Error: --cert and --key are required for 'full' mode${NC}"
    exit 1
  fi
fi

# ============================================================
# Generate config
# ============================================================
generate_config() {
cat <<NGINX
# ============================================================
# Nginx config for ${DOMAIN}
# Mode: Cloudflare SSL ${SSL_MODE_LABEL}
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# ============================================================

# Upstream: PM2 cluster running 'serve' on port ${UPSTREAM_PORT}
upstream glitter_tattoo {
    server 127.0.0.1:${UPSTREAM_PORT};
    keepalive 32;
}

NGINX

# --- Alternate domain redirect ---
if [[ -n "$DOMAIN_ALT" ]]; then
  if [[ "$SSL_MODE" == "flexible" ]]; then
cat <<NGINX
# Redirect ${DOMAIN_ALT} → ${DOMAIN} (HTTP)
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN_ALT};
    return 301 http://${DOMAIN}\$request_uri;
}

NGINX
  else
cat <<NGINX
# Redirect ${DOMAIN_ALT} → ${DOMAIN} (HTTPS)
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${DOMAIN_ALT};

    ssl_certificate     ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};

    return 301 https://${DOMAIN}\$request_uri;
}

NGINX
  fi
fi

# --- Main server block ---
if [[ "$SSL_MODE" == "flexible" ]]; then
cat <<NGINX
# Main server block (HTTP - Cloudflare Flexible)
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

NGINX
else
  # HTTP → HTTPS redirect
  _alt_names=""
  if [[ -n "$DOMAIN_ALT" ]]; then
    _alt_names=" ${DOMAIN_ALT}"
  fi
cat <<NGINX
# Redirect HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN}${_alt_names};
    return 301 https://${DOMAIN}\$request_uri;
}

# Main server block (HTTPS - Cloudflare Full)
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ${DOMAIN};

    # SSL Configuration (Cloudflare Origin Certificate or Let's Encrypt)
    ssl_certificate     ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

NGINX
fi

# Cloudflare real IP (common for both modes)
cat <<NGINX
    # Trust Cloudflare proxy headers
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    # IPv6
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2a06:98c0::/29;
    set_real_ip_from 2c0f:f248::/32;
    real_ip_header CF-Connecting-IP;

NGINX

# --- Common server block content ---
cat <<NGINX
    root ${OUT_DIR};
    index index.html;

    # ---- Gzip Compression ----
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml
        application/rss+xml
        image/svg+xml
        font/woff2;

    # ---- Security Headers ----
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # ---- Static Assets (long cache) ----
    # Next.js hashed assets - cache forever
    location /_next/static/ {
        expires max;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Legacy images (responsive WebP + fallbacks)
    location /legacy/ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    # Other static files
    location ~* \.(ico|css|js|gif|jpe?g|png|webp|avif|svg|woff2?|ttf|eot)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        access_log off;
    }

    # ---- Locale Routing ----
    # Default root → Thai locale
    location = / {
        return 302 /th;
    }

    # Locale paths - try static files, then proxy to serve
    location ~ ^/(th|en|zh)(/.*)?$ {
        try_files \$uri \$uri/ \$uri/index.html @upstream;
    }

    # Legacy paths (old PHP URLs)
    location ~ ^/(th|en|zh)/2015/ {
        try_files \$uri \$uri/ \$uri/index.html @upstream;
    }

    # Sitemap and robots
    location = /robots.txt {
        try_files \$uri =404;
        access_log off;
    }
    location = /sitemap.xml {
        try_files \$uri =404;
        access_log off;
    }

    # ---- Fallback to upstream (serve) ----
    location @upstream {
        proxy_pass http://glitter_tattoo;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection "";
        proxy_cache_bypass \$http_upgrade;
    }

    # General fallback
    location / {
        try_files \$uri \$uri/ \$uri/index.html @upstream;
    }

    # ---- Error Pages ----
    error_page 404 /404/index.html;
    location = /404/index.html {
        internal;
    }

    # ---- Logging ----
    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log  /var/log/nginx/${DOMAIN}.error.log warn;
}
NGINX
}

# ============================================================
# Output
# ============================================================
if [[ -n "$OUTPUT_FILE" ]]; then
  generate_config > "$OUTPUT_FILE"
  echo -e "${GREEN}Config written to: ${OUTPUT_FILE}${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "  1. Review the config:  cat $OUTPUT_FILE"
  echo "  2. Test nginx config:  sudo nginx -t"
  echo "  3. Enable the site:    sudo ln -sf $OUTPUT_FILE /etc/nginx/sites-enabled/"
  echo "  4. Reload nginx:       sudo systemctl reload nginx"
else
  generate_config
fi

echo "" >&2
echo -e "${GREEN}========================================${NC}" >&2
echo -e "${GREEN} Mode: Cloudflare SSL ${SSL_MODE_LABEL}${NC}" >&2
if [[ "$SSL_MODE" == "flexible" ]]; then
  echo -e "${GREEN} Listening: port 80 (HTTP)${NC}" >&2
  echo -e "${YELLOW} Cloudflare handles HTTPS → HTTP to your server${NC}" >&2
else
  echo -e "${GREEN} Listening: port 443 (HTTPS) + 80 (redirect)${NC}" >&2
  echo -e "${YELLOW} Cloudflare connects via HTTPS to your server${NC}" >&2
fi
echo -e "${GREEN} Upstream: 127.0.0.1:${UPSTREAM_PORT} (PM2 serve)${NC}" >&2
echo -e "${GREEN}========================================${NC}" >&2
