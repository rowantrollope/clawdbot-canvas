#!/usr/bin/env bash
# Canvas API helper script
# Usage: canvas.sh <command> [args]
#
# Commands:
#   list                    List active cards
#   list-all                List all cards including archived
#   list-archived           List only archived cards
#   get <id>                Get a specific card
#   upsert <json>           Create or update a card
#   upsert-file <file>      Create or update from JSON file
#   patch <id> <json>       Partial update a card
#   archive <id>            Archive a card
#   restore <id>            Restore an archived card
#   delete <id>             Permanently delete a card
#   clear                   Delete all cards (dangerous!)
#   clear-archive           Delete all archived cards
#   demo                    Load demo cards
#
# Environment:
#   CANVAS_URL              Base URL (default: http://localhost:5173)
#   CLAWDBOT_CANVAS_TOKEN   Auth token (required if server has auth)

set -e

CANVAS_URL="${CANVAS_URL:-http://localhost:5173}"
TOKEN="${CLAWDBOT_CANVAS_TOKEN:-}"

auth_header() {
  if [[ -n "$TOKEN" ]]; then
    echo "Authorization: Bearer $TOKEN"
  else
    echo "X-No-Auth: true"
  fi
}

case "${1:-help}" in
  list)
    curl -s "$CANVAS_URL/api/cards" -H "$(auth_header)" | jq .
    ;;
  list-all)
    curl -s "$CANVAS_URL/api/cards?include=archived" -H "$(auth_header)" | jq .
    ;;
  list-archived)
    curl -s "$CANVAS_URL/api/cards?state=archived" -H "$(auth_header)" | jq .
    ;;
  get)
    [[ -z "$2" ]] && echo "Usage: canvas.sh get <id>" && exit 1
    curl -s "$CANVAS_URL/api/cards?include=archived" -H "$(auth_header)" | jq ".[] | select(.id == \"$2\")"
    ;;
  upsert)
    [[ -z "$2" ]] && echo "Usage: canvas.sh upsert '<json>'" && exit 1
    curl -s -X POST "$CANVAS_URL/api/cards" \
      -H "$(auth_header)" \
      -H "Content-Type: application/json" \
      -d "$2" | jq .
    ;;
  upsert-file)
    [[ -z "$2" ]] && echo "Usage: canvas.sh upsert-file <file.json>" && exit 1
    curl -s -X POST "$CANVAS_URL/api/cards" \
      -H "$(auth_header)" \
      -H "Content-Type: application/json" \
      -d @"$2" | jq .
    ;;
  patch)
    [[ -z "$2" || -z "$3" ]] && echo "Usage: canvas.sh patch <id> '<json>'" && exit 1
    curl -s -X PATCH "$CANVAS_URL/api/cards/$(printf %s "$2" | jq -sRr @uri)" \
      -H "$(auth_header)" \
      -H "Content-Type: application/json" \
      -d "$3" | jq .
    ;;
  archive)
    [[ -z "$2" ]] && echo "Usage: canvas.sh archive <id>" && exit 1
    curl -s -X POST "$CANVAS_URL/api/cards/$(printf %s "$2" | jq -sRr @uri)/archive" \
      -H "$(auth_header)" | jq .
    ;;
  restore)
    [[ -z "$2" ]] && echo "Usage: canvas.sh restore <id>" && exit 1
    curl -s -X POST "$CANVAS_URL/api/cards/$(printf %s "$2" | jq -sRr @uri)/restore" \
      -H "$(auth_header)" | jq .
    ;;
  delete)
    [[ -z "$2" ]] && echo "Usage: canvas.sh delete <id>" && exit 1
    curl -s -X DELETE "$CANVAS_URL/api/cards/$(printf %s "$2" | jq -sRr @uri)" \
      -H "$(auth_header)" | jq .
    ;;
  clear)
    echo "⚠️  This will delete ALL cards. Type 'yes' to confirm:"
    read -r confirm
    [[ "$confirm" != "yes" ]] && echo "Aborted." && exit 1
    curl -s -X DELETE "$CANVAS_URL/api/cards" -H "$(auth_header)" | jq .
    ;;
  clear-archive)
    curl -s -X DELETE "$CANVAS_URL/api/archive" -H "$(auth_header)" | jq .
    ;;
  demo)
    curl -s -X POST "$CANVAS_URL/api/demo" -H "$(auth_header)" | jq .
    ;;
  help|--help|-h|*)
    head -19 "$0" | tail -18
    ;;
esac
