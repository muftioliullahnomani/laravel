#!/usr/bin/env bash
set -uo pipefail

# Default PORT if not provided by Render
export PORT="${PORT:-10000}"

# Render injects PORT; template nginx conf
if [ -f /etc/nginx/templates/default.conf.template ]; then
  echo "[start.sh] Templating nginx config for PORT=${PORT}"
  if command -v envsubst >/dev/null 2>&1; then
    envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
  else
    # Fallback: basic substitution without envsubst
    sed "s/\$PORT/${PORT}/g" /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
  fi
fi

# Ensure storage links and perms
echo "[start.sh] Linking storage"
php artisan storage:link || true
# Ensure required storage directories exist
echo "[start.sh] Ensure storage/framework and bootstrap/cache exist"
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache || true
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# Ensure .env exists (Render doesn't provide a file by default)
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env || true
  else
    touch .env || true
  fi
fi

# Ensure .env owned and writable by web user
echo "[start.sh] Ensure .env ownership and perms"
chown www-data:www-data .env || true
chmod 660 .env || true

# Clear caches first to avoid stale config using empty APP_KEY
echo "[start.sh] Clearing caches"
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Generate APP_KEY if missing
if [ -z "${APP_KEY:-}" ] || [ "${APP_KEY}" = "" ]; then
  echo "[start.sh] Generating APP_KEY"
  php artisan key:generate --force || true
fi

# If APP_KEY still empty, try to export from .env (helps current process)
if [ -z "${APP_KEY:-}" ]; then
  if grep -q '^APP_KEY=' .env 2>/dev/null; then
    export APP_KEY="$(grep -E '^APP_KEY=' .env | cut -d= -f2- | tr -d '\r')"
  fi
fi

# If .env still lacks a non-empty APP_KEY, generate and write one directly
CURRENT_KEY="$(grep -E '^APP_KEY=' .env 2>/dev/null | cut -d= -f2- | tr -d '\r')"
if [ -z "${CURRENT_KEY}" ]; then
  GEN_KEY=$(php -r "echo 'base64:'.base64_encode(random_bytes(32));" 2>/dev/null || true)
  if [ -n "${GEN_KEY}" ]; then
    if grep -q '^APP_KEY=' .env 2>/dev/null; then
      sed -i "s/^APP_KEY=.*/APP_KEY=${GEN_KEY}/" .env || true
    else
      printf "\nAPP_KEY=%s\n" "${GEN_KEY}" >> .env || true
    fi
    export APP_KEY="${GEN_KEY}"
    # Clear config again to ensure fresh key is loaded
    php artisan config:clear || true
  fi
fi

# If using SQLite, ensure database file exists and env is set
if [ "${DB_CONNECTION:-}" = "sqlite" ]; then
  echo "[start.sh] Preparing SQLite database file"
  mkdir -p database
  if [ ! -f database/database.sqlite ]; then
    touch database/database.sqlite
  fi
  # Ensure Laravel sees the sqlite path
  export DB_DATABASE="/var/www/html/database/database.sqlite"
  chown -R www-data:www-data database || true
  chmod -R 775 database || true
fi

# Optimize for production
echo "[start.sh] Optimize"
php artisan optimize || true

# Run database migrations if DB is configured and reachable (optional, no-fail)
echo "[start.sh] Migrate (non-fatal)"
php artisan migrate --force || true

# If ADMIN_EMAIL is provided, promote that user to admin automatically
if [ -n "${ADMIN_EMAIL:-}" ]; then
  echo "[start.sh] Auto-promote ADMIN_EMAIL=${ADMIN_EMAIL}"
  php -r "require 'vendor/autoload.php'; \
    (function(){ \
      \$app = require 'bootstrap/app.php'; \
      \$kernel = \$app->make(Illuminate\\Contracts\\Console\\Kernel::class); \
      \$kernel->bootstrap(); \
      \$email = getenv('ADMIN_EMAIL'); \
      \$plain = getenv('ADMIN_PASSWORD') ?: null; \
      \$hashed = \$plain ? bcrypt(\$plain) : bcrypt(str()->random(16)); \
      if (\$email) { \
        \$affected = App\\Models\\User::where('email',\$email)->update(\$plain ? ['is_admin'=>true,'password'=>\$hashed] : ['is_admin'=>true]); \
        if (!\$affected) { \
          App\\Models\\User::firstOrCreate(['email'=>\$email], ['name'=>'Admin','password'=>\$hashed,'email_verified_at'=>now(),'is_admin'=>true]); \
        } \
      } \
    })();" || true
fi

# Non-fatal config tests for visibility
nginx -t || true
php -v || true

echo "[start.sh] Starting supervisord (php-fpm + nginx)"
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
