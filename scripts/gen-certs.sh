#!/usr/bin/env bash
# Generates throwaway certificates for the local demo. Never commit them.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
certs="$root/certs"
mkdir -p "$certs"

if [ -f "$certs/sp.pfx" ] && [ -f "$certs/pasarela.pfx" ] && [ -f "$certs/attacker.pfx" ]; then
  echo "gen-certs: certificates already exist in $certs"
  exit 0
fi

make_cert() {
  local name="$1"
  openssl req -x509 -newkey rsa:2048 -sha256 -days 365 -nodes \
    -keyout "$certs/$name.key" -out "$certs/$name.crt" \
    -subj "/CN=AuthKit demo $name" >/dev/null 2>&1
  openssl pkcs12 -export -out "$certs/$name.pfx" \
    -inkey "$certs/$name.key" -in "$certs/$name.crt" \
    -passout pass: >/dev/null 2>&1
}

make_cert sp
make_cert pasarela
make_cert attacker

cp "$certs/pasarela.crt" "$certs/pasarela-public.crt"
echo "gen-certs: wrote sp.pfx, pasarela.pfx, pasarela-public.crt and attacker.pfx to $certs"
