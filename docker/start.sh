#!/usr/bin/env bash
set -euo pipefail

# Default PORT if not provided by Render
export PORT="${PORT:-10000}"

# Render injects PORT; template nginx conf
if [ -f /etc/nginx/templates/default.conf.template ]; then
  envsubst '\n$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# Ensure storage links and perms
php artisan storage:link || true
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# Generate APP_KEY if missing
if [ -z "${APP_KEY:-}" ] || [ "$APP_KEY" = "" ]; then
  php artisan key:generate --force || true
fi

# If using SQLite, ensure database file exists and env is set
if [ "${DB_CONNECTION:-}" = "sqlite" ]; then
  mkdir -p database
  if [ ! -f database/database.sqlite ]; then
    touch database/database.sqlite
  fi
  # Ensure Laravel sees the sqlite path
  export DB_DATABASE="/var/www/html/database/database.sqlite"
  chown -R www-data:www-data database || true
  chmod -R 775 database || true
fi

# Optimize config/routes/views for production
php artisan optimize || true

# Run database migrations if DB is configured and reachable (optional, no-fail)
php artisan migrate --force || true

# If ADMIN_EMAIL is provided, promote that user to admin automatically
if [ -n "${ADMIN_EMAIL:-}" ]; then
  php -r "require 'vendor/autoload.php'; \
    /** bootstrap Laravel **/ \
    (function(){ \
      $app = require 'bootstrap/app.php'; \
      $kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class); \
      $kernel->bootstrap(); \
      $email = getenv('ADMIN_EMAIL'); \
      if ($email) { \
        $affected = App\\Models\\User::where('email',$email)->update(['is_admin'=>true]); \
        if (!$affected) { \
          // If user doesn't exist yet, try to create a minimal verified user
          App\\Models\\User::firstOrCreate(['email'=>$email], ['name'=>'Admin','password'=>bcrypt(str()->random(16)),'email_verified_at'=>now(),'is_admin'=>true]); \
        } \
      } \
    })();" || true
fi

# Start Supervisor (which starts php-fpm and nginx)
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
