# Multi-stage build for Laravel on Render

# 1) Composer stage: install PHP dependencies
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# 2) Node stage: build frontend assets with Vite
FROM node:20-bullseye AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY tsconfig.json vite.config.* postcss.config.* tailwind.config.* ./
RUN npm run build

# 3) Final stage: PHP-FPM + Nginx + Supervisor
FROM php:8.2-fpm-bullseye AS runtime

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    git \
    unzip \
    curl \
    gettext-base \
    libicu-dev \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) pdo_mysql intl zip gd \
    && rm -rf /var/lib/apt/lists/*

# Configure PHP
COPY --from=vendor /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application source (excluding heavy dirs via .dockerignore)
COPY . .

# Copy vendor from composer stage
COPY --from=vendor /app/vendor ./vendor

# Copy built frontend assets
COPY --from=frontend /app/public/build ./public/build

# Ensure storage and cache are writable
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Nginx configuration via envsubst of the listen PORT
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Expose the port (Render sets PORT env; nginx will be templated to use it)
EXPOSE 10000

# Healthcheck (simple): try hitting nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD curl -f http://127.0.0.1:${PORT:-10000}/ || exit 1

CMD ["/start.sh"]
