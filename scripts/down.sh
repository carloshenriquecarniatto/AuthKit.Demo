#!/usr/bin/env bash
# Stops the stack and removes its volumes. The generated .env and certificates are left in place.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
docker compose --project-directory "$root" -f "$root/docker-compose.yml" down -v
echo "down: stack removed."
