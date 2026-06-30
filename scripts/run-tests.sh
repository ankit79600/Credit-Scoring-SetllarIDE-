#!/usr/bin/env bash
# ================================================================
# run-tests.sh — Run Soroban contract unit tests
# ================================================================

set -euo pipefail

echo "==> Running Soroban contract tests..."
(cd contract && cargo test -- --test-threads=1 2>&1)

echo ""
echo "✅ All tests passed!"
