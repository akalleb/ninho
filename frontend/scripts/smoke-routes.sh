#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
COOKIE_HEADER="${COOKIE_HEADER:-access_token=dummy}"

check_route() {
  local url="$1"
  local expected="$2"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' -H "Cookie: ${COOKIE_HEADER}" "${url}")"
  if [[ "${code}" != "${expected}" ]]; then
    echo "FAIL ${url} expected=${expected} got=${code}"
    return 1
  fi
  echo "OK   ${url} -> ${code}"
}

echo "Smoke test em ${BASE_URL}"
check_route "${BASE_URL}/auth" "200"
check_route "${BASE_URL}/admin/projects" "200"
check_route "${BASE_URL}/admin/wallets/1" "200"
check_route "${BASE_URL}/admin/reports" "200"
check_route "${BASE_URL}/admin/resource-sources" "200"

echo "Smoke test concluído com sucesso"
