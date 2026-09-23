#!/usr/bin/env bash
# Fix daubys-true-value CI deploy: set GitHub secrets, verify build, trigger workflow.
# Run from repo root. Values from 1Password → Development Resources.
set -euo pipefail

REPO="mightylocalsites/daubys-true-value"
SECRETS_ONLY=false

usage() {
  echo "Usage: $0 [--secrets-only]"
  echo "  --secrets-only   Set GitHub secrets and re-run workflow (skip local npm ci/build)"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --secrets-only) SECRETS_ONLY=true; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1" >&2; usage ;;
  esac
done

need() {
  if [[ -z "${!1:-}" ]]; then
    echo "Missing $1 — export it first (1Password → Development Resources)." >&2
    exit 1
  fi
}

need NODE_AUTH_TOKEN
need CF_WFP_DEPLOY_KEY
need CLOUDFLARE_ACCOUNT_ID

if ! gh auth status &>/dev/null; then
  echo "→ Logging gh in with NODE_AUTH_TOKEN…"
  printf '%s' "$NODE_AUTH_TOKEN" | gh auth login --with-token
fi

echo "→ Setting GitHub Actions secrets on $REPO…"
gh secret set NODE_AUTH_TOKEN --repo "$REPO" --body "$NODE_AUTH_TOKEN"
gh secret set CF_WFP_DEPLOY_KEY --repo "$REPO" --body "$CF_WFP_DEPLOY_KEY"
gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$REPO" --body "$CLOUDFLARE_ACCOUNT_ID"

gh secret list --repo "$REPO"

if [[ "$SECRETS_ONLY" == false ]]; then
  echo "→ Installing dependencies…"
  npm ci
  echo "→ Verifying build…"
  npm run build
fi

echo "→ Re-running failed workflow…"
gh run rerun --repo "$REPO" --failed 2>/dev/null || \
  gh workflow run "Deploy Astro site Worker" --repo "$REPO" --ref master

echo
echo "Watch: gh run watch --repo $REPO"
echo "       https://github.com/$REPO/actions"
