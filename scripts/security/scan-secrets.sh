#!/usr/bin/env bash
# scan-secrets.sh — Scan worktree and Git history for leaked secrets.
#
# Usage:
#   bash scripts/security/scan-secrets.sh
#
# Requires gitleaks >= 8. Downloads a binary from GitHub releases when absent.
# Safe placeholder values in .env.example files are allowed via .gitleaks.toml.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONFIG="$REPO_ROOT/.gitleaks.toml"
GITLEAKS_VERSION="8.27.2"
GITLEAKS_BIN="${TMPDIR:-/tmp}/gitleaks"

# ---------------------------------------------------------------------------
# Install gitleaks if not already available
# ---------------------------------------------------------------------------
if ! command -v gitleaks &>/dev/null; then
  if [[ ! -x "$GITLEAKS_BIN" ]]; then
    echo "[scan-secrets] Installing gitleaks $GITLEAKS_VERSION to $GITLEAKS_BIN…"
    OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
    ARCH="$(uname -m)"
    case "$ARCH" in
      x86_64) ARCH="x64" ;;
      aarch64|arm64) ARCH="arm64" ;;
      *) echo "Unsupported architecture: $ARCH" >&2; exit 1 ;;
    esac
    URL="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_${OS}_${ARCH}.tar.gz"
    curl -fsSL "$URL" | tar -xz -C "${TMPDIR:-/tmp}" gitleaks
    chmod +x "$GITLEAKS_BIN"
  fi
  GITLEAKS="$GITLEAKS_BIN"
else
  GITLEAKS="$(command -v gitleaks)"
fi

echo "[scan-secrets] Using gitleaks: $GITLEAKS ($(${GITLEAKS} version 2>/dev/null || echo 'version unknown'))"
echo "[scan-secrets] Config: $CONFIG"
echo ""

FAILED=0

# ---------------------------------------------------------------------------
# Scan working tree
# ---------------------------------------------------------------------------
echo "=== Scanning working tree ==="
if "$GITLEAKS" detect \
    --source "$REPO_ROOT" \
    --config "$CONFIG" \
    --redact \
    --verbose; then
  echo "[scan-secrets] Working tree: CLEAN"
else
  echo "[scan-secrets] Working tree: SECRETS FOUND" >&2
  FAILED=1
fi

echo ""

# ---------------------------------------------------------------------------
# Scan full Git history
# ---------------------------------------------------------------------------
echo "=== Scanning Git history ==="
if "$GITLEAKS" git \
    "$REPO_ROOT" \
    --config "$CONFIG" \
    --redact \
    --verbose; then
  echo "[scan-secrets] Git history: CLEAN"
else
  echo "[scan-secrets] Git history: SECRETS FOUND" >&2
  FAILED=1
fi

echo ""

if [[ "$FAILED" -eq 0 ]]; then
  echo "[scan-secrets] All checks passed. No secrets detected."
  exit 0
else
  echo "[scan-secrets] One or more secret scans failed. Review the output above." >&2
  exit 1
fi
