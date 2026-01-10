#!/bin/bash
# Helper script to extract deployed contract addresses from Odra CLI output
# Usage: ./extract_addresses.sh deployment_output.txt

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <deployment_output_file>"
    echo "Example: cargo run --bin anchore_deploy -- deploy 2>&1 | tee deployment.log"
    echo "         ./extract_addresses.sh deployment.log"
    exit 1
fi

OUTPUT_FILE="$1"

if [ ! -f "$OUTPUT_FILE" ]; then
    echo "Error: File '$OUTPUT_FILE' not found"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 EXTRACTED ADDRESSES FOR WEB APP CONFIG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Extract token addresses
echo "🪙 TOKENS (for apps/web/data/index.ts):"
echo ""

grep -A 5 "TOKENS:" "$OUTPUT_FILE" | grep -E "(USDC|USDT|WBTC|DAI|WETH):" | while read line; do
    token=$(echo "$line" | awk '{print $1}' | tr -d ':')
    hash=$(echo "$line" | grep -oE "hash-[a-f0-9]{64}" | sed 's/hash-//')
    
    if [ ! -z "$hash" ]; then
        echo "  $token: \"$hash\","
    fi
done

echo ""
echo "🏊 AMM POOLS (for apps/web/data/swap-and-bridge-routes.ts):"
echo ""

grep -A 4 "AMM POOLS:" "$OUTPUT_FILE" | grep -E "Pool" | while read line; do
    pool=$(echo "$line" | awk '{print $1}' | tr -d ':')
    hash=$(echo "$line" | grep -oE "hash-[a-f0-9]{64}" | sed 's/hash-//')
    
    if [ ! -z "$hash" ]; then
        echo "  $pool: \"$hash\","
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Copy these addresses and update:"
echo "   1. apps/web/data/index.ts (TOKENS array)"
echo "   2. apps/web/data/swap-and-bridge-routes.ts (CASPER_SWAP_ROUTES)"
echo ""
