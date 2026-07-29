# syntax=docker/dockerfile:1
# Static build of the docs site, served by nginx. Content is cloned into ./docs and ./i18n by CI
# before the build context is sent, so this image is self-contained and reproducible from a sha.

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

# Restore first so dependency layers cache independently of content changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Builds every configured locale (ru, en, uz) into /app/build.
ARG DOCSEARCH_APP_ID
ARG DOCSEARCH_API_KEY
ARG DOCSEARCH_INDEX_NAME
RUN npm run build

# ---- serve ----
# Unprivileged nginx: runs as uid 101 and listens on 8080, so the container needs no root.
FROM nginxinc/nginx-unprivileged:alpine AS runtime

COPY --chown=nginx:nginx nginx/site.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/build /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
