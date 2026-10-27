#!/usr/bin/env bash
# Builds the static documentation site published on GitHub Pages: landing + Angular gallery +
# Storybook (Angular stories only; the Blazor frames need the .NET host).
#
# PAGES_BASE is the site root, e.g. "/AuthKit.Demo/" for a project page or "/" for a custom domain.
# The script expects the npm dependencies to be installed and AuthKit.Angular already built.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
base="${PAGES_BASE:-/}"

case "$base" in
  "" | "/") base="/" ;;
  *) base="/${base#/}"; base="${base%/}/" ;;
esac

site="$root/_site"

if [ ! -d "$root/src/angular-demo/node_modules" ]; then
  echo "pages-build: run npm ci in src/angular-demo, src/angular-storybook and src/blazor-storybook first." >&2
  exit 1
fi

echo "pages-build: base ${base}"
rm -rf "$site"
mkdir -p "$site"

(
  cd "$root/src/angular-demo"
  npx ng build --base-href "${base}angular/"
)

(
  cd "$root/src/angular-storybook"
  npm run build
)

(
  cd "$root/src/blazor-storybook"
  PAGES=1 PAGES_BASE="$base" npm run build
)

cp -R "$root/src/pages/." "$site/"
cp -R "$root/src/blazor-storybook/storybook-static" "$site/storybook"
cp -R "$root/src/angular-storybook/storybook-static" "$site/storybook/angular"
cp -R "$root/src/angular-demo/dist/angular-demo/browser" "$site/angular"

mkdir -p "$site/shared"
cp "$root/src/AuthKit.Demo.Host/wwwroot/shared/demo.css" "$site/shared/demo.css"
cp "$root/src/AuthKit.Demo.Host/wwwroot/pt.json" "$site/pt.json"

# GitHub Pages' Jekyll would ignore files/directories starting with an underscore.
touch "$site/.nojekyll"

echo "pages-build: wrote $site"
