#!/usr/bin/env bash
# ================================================================
# deploy-contract.sh — Build and deploy the Soroban credit scoring contract
# Usage: ./scripts/deploy-contract.sh [--secret <SECRET_KEY>]
# ================================================================

set -euo pipefail

NETWORK="testnet"
CONTRACT_DIR="contract"
WASM_PATH="$CONTRACT_DIR/target/wasm32-unknown-unknown/release/contract.wasm"

# Parse args
SECRET_KEY="${1:-}"
if [[ "$1" == "--secret" && -n "${2:-}" ]]; then
  SECRET_KEY="$2"
fi

if [[ -z "$SECRET_KEY" ]]; then
  echo "Usage: ./scripts/deploy-contract.sh --secret <YOUR_SECRET_KEY>"
  echo "Or set STELLAR_SECRET_KEY env variable."
  SECRET_KEY="${STELLAR_SECRET_KEY:-}"
  if [[ -z "$SECRET_KEY" ]]; then
    echo "ERROR: No secret key provided. Exiting."
    exit 1
  fi
fi

echo "==> Building Soroban contract..."
(cd "$CONTRACT_DIR" && stellar contract build)

echo "==> Deploying to $NETWORK..."
CONTRACT_ADDRESS=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --network "$NETWORK" \
  --source "$SECRET_KEY" 2>&1 | tail -1)

echo ""
echo "✅ Contract deployed successfully!"
echo "   Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "Update CONTRACT_ADDRESS in client/hooks/contract.ts:"
echo "   export const CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\";"
