#!/bin/sh
set -eu

cat <<EOF >/usr/share/nginx/html/env-config.js
window.__APP_CONFIG__ = {
  VITE_BACKEND_URL: "${VITE_BACKEND_URL:-}"
};
EOF