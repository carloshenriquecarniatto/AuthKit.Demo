#!/usr/bin/env bash
# Builds and starts the whole demo: Supabase Auth, Mailpit and the .NET host (which also serves
# the Angular and Storybook builds). Everything is published on loopback.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! docker info >/dev/null 2>&1; then
  echo "up: Docker is not running. Start Docker Desktop or colima first." >&2
  exit 1
fi

node "$root/scripts/demo-secrets.mjs"

echo "up: building and starting the stack (the first build takes a few minutes)..."
docker compose --project-directory "$root" -f "$root/docker-compose.yml" up --build -d

echo "up: waiting for the host..."
for _ in $(seq 1 120); do
  if curl -fsS http://127.0.0.1:5080/ >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! curl -fsS http://127.0.0.1:5080/ >/dev/null 2>&1; then
  echo "up: the host did not become ready. Logs:" >&2
  docker compose --project-directory "$root" -f "$root/docker-compose.yml" logs --tail=60 host >&2
  exit 1
fi

cat <<'EOF'

AuthKit demo is up:

  Blazor        http://localhost:5080/blazor
  Angular       http://localhost:5080/angular/
  Storybook     http://localhost:5080/storybook/
  Mailpit       http://localhost:8025
  Config        http://localhost:5080/config.json

Stop with: bash scripts/down.sh
EOF
