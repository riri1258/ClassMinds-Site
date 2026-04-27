#!/bin/bash
# Compute SRI hashes for the Firebase Web SDK imports we use. Run this once per
# SDK version bump; paste the output into the integrity="" attrs on admin pages.
#
# NOTE (2026-04): current admin pages use *dynamic* imports
#   (e.g. `await import('https://www.gstatic.com/firebasejs/10.12.0/…')`)
# which browsers don't currently validate against `<script integrity>`.
# SRI for dynamic imports requires Import Maps with `integrity` — which is
# still a draft. Until then, these hashes are for future use / audit trail;
# the CSP's `script-src` whitelist of `https://www.gstatic.com` is the real
# runtime guardrail. When we move to static `<script type="module" src="…">`
# or Import-Map-based loading, paste these values into the `integrity=""`
# attributes.
#
# Usage:  chmod +x compute-sri.sh && ./compute-sri.sh
VERSION="10.12.0"
MODULES=("firebase-app" "firebase-auth" "firebase-firestore" "firebase-functions" "firebase-storage")
for mod in "${MODULES[@]}"; do
  url="https://www.gstatic.com/firebasejs/$VERSION/$mod.js"
  hash=$(curl -sS "$url" | openssl dgst -sha384 -binary | openssl base64 -A)
  echo "integrity=\"sha384-$hash\" crossorigin=\"anonymous\"  # $mod"
done
