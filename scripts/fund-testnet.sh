#!/usr/bin/env bash
# ================================================================
# fund-testnet.sh — Fund a Stellar testnet account via Friendbot
# Usage: ./scripts/fund-testnet.sh <PUBLIC_KEY>
# ================================================================

set -euo pipefail

ADDRESS="${1:-}"
if [[ -z "$ADDRESS" ]]; then
  echo "Usage: ./scripts/fund-testnet.sh <STELLAR_PUBLIC_KEY>"
  exit 1
fi

echo "==> Funding $ADDRESS on testnet..."
curl -s "https://friendbot.stellar.org?addr=$ADDRESS" | python3 -m json.tool || \
  curl -s "https://friendbot.stellar.org?addr=$ADDRESS"

echo ""
echo "✅ Done! Check balance at https://stellar.expert/explorer/testnet/account/$ADDRESS"
