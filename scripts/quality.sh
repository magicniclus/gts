#!/usr/bin/env bash
# Qualité et SEO sur le build de production (05-tests.md §6), dans les émulateurs :
#   npm run quality
set -euo pipefail
PORT=3100
export BASE_URL="http://localhost:${PORT}"
npm run seed
npx next build
npx next start -p "$PORT" > .next/quality-server.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for _ in $(seq 1 60); do curl -sf "$BASE_URL/" > /dev/null && break; sleep 1; done

echo "▶ Contrôle SEO"
npx tsx scripts/check-seo.ts

echo "▶ Liens cassés (linkinator)"
npx linkinator "$BASE_URL" --recurse --concurrency 8 --skip "^(?!http://localhost:${PORT})" --skip "/espace-proprietaire" --skip "/_next/image"

echo "▶ Poids du JavaScript (garde-fou : 215 Ko gzip, socle Next 16 + React 19 ≈ 195 Ko)"
JS_BUDGET_KB=215 npx tsx scripts/js-budget.ts / /diagnostic-dpe-marseille /diagnostic-dpe/aubagne /devis /conseils

echo "▶ Lighthouse CI"
npx lhci autorun
