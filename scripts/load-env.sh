#!/usr/bin/env bash
# ====================================================================
# load-env.sh — Safely load .env variables into the current shell
# ====================================================================
#
# Usage:
#   source scripts/load-env.sh         # load all vars
#   source scripts/load-env.sh VERIFY  # only verify .env exists & has tokens
#
# This script:
#   - Sources .env without printing any values
#   - Validates required variables are set (non-empty)
#   - Exits with non-zero code if any required var is missing
#   - Never echoes token values to stdout/stderr
#
# After sourcing, you can use $GITHUB_TOKEN etc. in shell commands.
# ====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

# Helper: silent check that a var is set and non-empty
_var_set() {
  local var_name="$1"
  if [ -z "${!var_name}" ]; then
    return 1
  fi
  # Also reject the placeholder text
  case "${!var_name}" in
    PASTE_YOUR_*_HERE)
      return 1
      ;;
  esac
  return 0
}

# Verify .env exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env file not found at: $ENV_FILE" >&2
  echo "" >&2
  echo "Create it by copying the example:" >&2
  echo "  cp .env.example .env" >&2
  echo "Then edit .env and fill in your tokens." >&2
  return 1 2>/dev/null || exit 1
fi

# Source the .env file silently
# Use a subshell to avoid polluting global namespace
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# If user just wants to verify, do that and exit
if [ "$1" = "VERIFY" ]; then
  echo "Checking .env variables..."
  echo ""

  MISSING=0
  for var in GITHUB_TOKEN VERCEL_TOKEN VERCEL_PROJECT_ID VERCEL_ORG_ID CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN CLOUDFLARE_ZONE_ID; do
    if _var_set "$var"; then
      # Show only first 4 and last 4 chars, mask the middle
      val="${!var}"
      masked="${val:0:4}...${val: -4}"
      echo "  ✅ $var = $masked (length: ${#val})"
    else
      echo "  ⚠️  $var is not set or still has placeholder"
      MISSING=$((MISSING + 1))
    fi
  done

  echo ""
  if [ $MISSING -gt 0 ]; then
    echo "❌ $MISSING variable(s) need to be set in .env"
    return 1 2>/dev/null || exit 1
  else
    echo "✅ All variables are set"
    return 0 2>/dev/null || exit 0
  fi
fi

# Otherwise, validate required variables and stay silent
if ! _var_set "GITHUB_TOKEN"; then
  echo "❌ GITHUB_TOKEN is not set or still has placeholder" >&2
  echo "" >&2
  echo "Edit .env and replace PASTE_YOUR_GITHUB_TOKEN_HERE" >&2
  echo "with your actual token from https://github.com/settings/personal-access-tokens" >&2
  return 1 2>/dev/null || exit 1
fi
