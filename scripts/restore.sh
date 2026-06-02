#!/bin/sh

set -e

if [ -z "$1" ]; then
  echo "Uso: ./scripts/restore.sh caminho/do/arquivo.archive"
  exit 1
fi

BACKUP_FILE="$1"

docker compose exec -T mongodb sh -c 'mongorestore --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --drop --db pi_db --archive' < "$BACKUP_FILE"

echo "Restore concluído a partir de: $BACKUP_FILE"