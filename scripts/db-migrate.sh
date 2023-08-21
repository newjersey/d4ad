#!/usr/bin/env bash

cd $(git rev-parse --show-toplevel)

source ./backend/.env

ENV=${NODE_ENV}
HOST_ENV_VAR=$(jq -r ".${ENV}.writer.host.ENV" backend/database.json)
PASSWORD_ENV_VAR=$(jq -r ".${ENV}.writer.password_encoded.ENV" backend/database.json)
DB_NAME=$(jq -r ".${ENV}.writer.database" backend/database.json)

echo "NODE_ENV value: $ENV"
echo "Host env var: $HOST_ENV_VAR"
echo "Password env var: $PASSWORD_ENV_VAR"
echo "Database name: $DB_NAME"
DB_HOST=${!HOST_ENV_VAR}
DB_PASSWORD=${!PASSWORD_ENV_VAR}

echo "Database host: $DB_HOST"
echo "Database password length: ${#DB_PASSWORD}"

DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@$DB_HOST:5432/$DB_NAME"

export DATABASE_URL
echo "Database URL: $DATABASE_URL"
echo "DB PW: $ENCODED_DB_PASS"
npm --prefix=backend run db-migrate up
