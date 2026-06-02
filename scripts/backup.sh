#!/bin/sh

set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="./backups/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

docker compose exec -T mongodb sh -c 'mongodump --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db pi_db --archive' > "$BACKUP_DIR/pi_db.archive"

echo "Backup criado em: $BACKUP_DIR/pi_db.archive"
``