#!/usr/bin/env bash
set -euo pipefail

# Roda dentro do repo ja clonado na propria VPS (pull-based, sem
# rsync/scp de maquina local — mesmo padrao do system-design-simulator).
REPO_DIR="${REPO_DIR:-/opt/conferir-loteria}"
cd "$REPO_DIR"

echo "Executando git pull"
git checkout -- .
git pull

echo "Executando npm ci"
npm ci

echo "Executando npm run build"
rm -rf dist/
npm run build

APP_ROOT="/var/www/loteria.prsites.com.br"
RELEASES_DIR="$APP_ROOT/releases"
CURRENT_LINK="$APP_ROOT/current"

mkdir -p "$RELEASES_DIR"

if [ ! -f dist/index.html ]; then
  echo "Build esperado em dist/index.html mas o arquivo nao foi encontrado."
  exit 1
fi

DEPLOY_ID="${DEPLOYMENT_ID:-manual-$(date +%Y%m%d%H%M%S)}"
RELEASE_DIR="$RELEASES_DIR/$DEPLOY_ID"

mkdir -p "$RELEASE_DIR"
cp -a dist/. "$RELEASE_DIR"/

sudo nginx -t

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

sudo systemctl reload nginx

echo "Deploy concluido: $RELEASE_DIR -> $CURRENT_LINK"
