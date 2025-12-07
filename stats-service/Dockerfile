# Stage 1: Build frontend
# CACHE_BUST: 2025-12-06-fix-frontend-api-paths
FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Verify that the build produced files with detailed output
RUN echo "=== Checking build output ===" && \
    ls -laR /app/frontend/dist && \
    echo "=== index.html content ===" && \
    cat /app/frontend/dist/index.html && \
    test -f /app/frontend/dist/index.html || \
    (echo "ERROR: Frontend build did not produce index.html!" && exit 1)

# Stage 2: Final image with Python backend and nginx
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    nginx \
    gcc \
    bash \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/api/ ./backend/api/

COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Verify frontend files were copied
RUN ls -la /usr/share/nginx/html && \
    test -f /usr/share/nginx/html/index.html || \
    (echo "ERROR: Frontend files not found in /usr/share/nginx/html!" && exit 1)

# Remove ALL default nginx configs and setup our config
RUN rm -f /etc/nginx/sites-enabled/default \
    && rm -f /etc/nginx/sites-available/default \
    && rm -f /etc/nginx/conf.d/*.conf \
    && rm -rf /var/www/html

COPY frontend/nginx.conf /etc/nginx/sites-available/default
RUN ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Verify nginx config
RUN nginx -t

EXPOSE 80 8001

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/backend

CMD bash -c "cd /app/backend && uvicorn api.api:app --host 0.0.0.0 --port 8001 & nginx -g 'daemon off;'"
