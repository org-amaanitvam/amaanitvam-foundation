#!/usr/bin/env bash
# Amaanitvam Foundation — v14 final deployed SSO fix
#
# Confirmed production failure:
#   OPTIONS /api/auth/cross-portal-token
#   Origin: https://amaanitvam-common-login.onrender.com
#   -> 403 Forbidden
#
# The gateway had two CORS middlewares. The first used a hard-coded list and
# returned 403 before the second (environment-aware) middleware could run.
# Consequently common-login could authenticate the user, but could not mint a
# cross-portal token; Dashboard then opened without ?authToken and showed its
# own login page.
#
# Run from the monorepo root:
#   bash apply-amaanitvam-cors-handoff-v14.sh

set -euo pipefail

ROOT="${1:-.}"
cd "$ROOT"

[ -f server/src/adminApiGateway.js ] || {
  echo "ERROR: run this from the repository root (server/src/adminApiGateway.js not found)."
  exit 1
}

STAMP="$(date +%Y%m%d%H%M%S)"
backup() {
  [ -f "$1" ] && cp "$1" "$1.v14.$STAMP.bak"
}

GATEWAY="server/src/adminApiGateway.js"
APP="server/src/app.js"

backup "$GATEWAY"
[ -f "$APP" ] && backup "$APP"

python3 - "$GATEWAY" <<'PY'
import re
import sys

path = sys.argv[1]
source = open(path, encoding="utf-8").read()

replacement = r'''// AMAANITVAM_CORS_V14_START
// One authoritative CORS policy. Keep this before every API route so browser
// preflights from common-login can reach /api/auth/cross-portal-token.
const gatewayDefaultOrigins = [
  "https://admin.amaanitvam.org",
  "https://dashboard.amaanitvam.org",
  "https://amaanitvam.org",
  "https://www.amaanitvam.org",
  "https://amaanitvam-common-login.onrender.com",
  "https://login.amaanitvam.org",
];

const gatewayConfiguredOrigins = [
  process.env.ADMIN_PORTAL_ORIGIN,
  process.env.COMMON_LOGIN_ORIGIN,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => String(value).split(","))
  .map((value) => value.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const gatewayAllowedOrigins = new Set([
  ...gatewayDefaultOrigins,
  ...gatewayConfiguredOrigins,
]);

app.use((req, res, next) => {
  const origin = String(req.headers.origin || "").replace(/\/+$/, "");
  const isLocal = /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin);
  const originAllowed = !origin || isLocal || gatewayAllowedOrigins.has(origin);

  if (origin && !originAllowed) {
    console.warn(`[admin-gateway] CORS blocked origin: ${origin}`);
  }

  if (origin && originAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, Cache-Control, Pragma, X-Requested-With"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return originAllowed ? res.sendStatus(204) : res.sendStatus(403);
  }

  return next();
});
// AMAANITVAM_CORS_V14_END'''

patterns = [
    # Current repository: two consecutive legacy middleware blocks.
    r'// FINAL ADMIN CORS START[\s\S]*?// ADMIN GATEWAY CORS FIX END',
    # Idempotent rerun.
    r'// AMAANITVAM_CORS_V14_START[\s\S]*?// AMAANITVAM_CORS_V14_END',
]

updated = source
for pattern in patterns:
    if re.search(pattern, updated):
        updated = re.sub(pattern, lambda _match: replacement, updated, count=1)
        break
else:
    anchor = 'function clean(value) {'
    if anchor not in updated:
        raise SystemExit("ERROR: could not locate the gateway CORS section or insertion anchor")
    updated = updated.replace(anchor, replacement + "\n\n" + anchor, 1)

# Remove a leftover second legacy block if an older repository variant placed
# it after the replaced section.
updated = re.sub(
    r'\n*// ADMIN GATEWAY CORS FIX START[\s\S]*?// ADMIN GATEWAY CORS FIX END\n*',
    '\n\n',
    updated,
    count=1,
)

open(path, "w", encoding="utf-8").write(updated)
print(f"patched {path}")
PY

# Keep the upstream API policy aligned as defense in depth. The public Render
# port normally hits the gateway first, but this prevents the same issue if the
# API is later deployed directly.
if [ -f "$APP" ]; then
python3 - "$APP" <<'PY'
import re
import sys

path = sys.argv[1]
source = open(path, encoding="utf-8").read()

if '"https://amaanitvam-common-login.onrender.com"' not in source:
    source = source.replace(
        '  "https://dashboard.amaanitvam.org",',
        '  "https://dashboard.amaanitvam.org",\n'
        '  "https://amaanitvam-common-login.onrender.com",\n'
        '  "https://login.amaanitvam.org",',
        1,
    )

# The old expression used A || B, so CORS_ORIGINS was silently ignored whenever
# ADMIN_PORTAL_ORIGIN existed. Read and merge all three variables instead.
old = '''  ...String(process.env.ADMIN_PORTAL_ORIGIN || process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),'''
new = '''  ...[
    process.env.ADMIN_PORTAL_ORIGIN,
    process.env.COMMON_LOGIN_ORIGIN,
    process.env.CORS_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((origin) => origin.trim().replace(/\\/+$/, ""))
    .filter(Boolean),'''
if old in source:
    source = source.replace(old, new, 1)

open(path, "w", encoding="utf-8").write(source)
print(f"patched {path}")
PY
fi

echo
echo "v14 applied successfully."
echo
echo "Render steps:"
echo "  1. Commit and push these backend changes."
echo "  2. Open the BACKEND service (amaanitvam-foundation)."
echo "  3. Set this environment variable (comma-separated, no quotes):"
echo "     CORS_ORIGINS=https://amaanitvam-common-login.onrender.com,https://admin.amaanitvam.org,https://dashboard.amaanitvam.org"
echo "  4. Clear build cache and deploy the BACKEND service."
echo "  5. Do not redeploy the three frontends again; their API URLs are already correct."
echo "  6. Test in an Incognito window."
echo
echo "Expected verification:"
echo "  OPTIONS /api/auth/cross-portal-token from the common-login origin returns 204,"
echo "  then POST returns 200 and Dashboard opens without its login screen."