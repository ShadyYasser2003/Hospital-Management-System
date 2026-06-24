#!/usr/bin/env bash
# =============================================================
#  Hospital Management System (HMS) — STOP SCRIPT
#  Stops the Backend (Spring Boot) + Frontend (Vite)
# =============================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT_DIR/.run/pids"

BACKEND_PORT=8080
FRONTEND_PORT=5173

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[ OK ]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }

echo "============================================================"
echo "   Hospital Management System (HMS) - STOP"
echo "============================================================"

# ── Helper: kill a process and all its children ──────────────
kill_tree() {
  local pid="$1"
  [ -z "$pid" ] && return 0
  # Kill child processes first
  for child in $(pgrep -P "$pid" 2>/dev/null); do
    kill_tree "$child"
  done
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null
    sleep 1
    # Force kill if still alive
    kill -9 "$pid" 2>/dev/null || true
  fi
}

# ── Helper: stop using a PID file ────────────────────────────
stop_by_pidfile() {
  local name="$1" pidfile="$2"
  if [ -f "$pidfile" ]; then
    local pid; pid="$(cat "$pidfile")"
    if kill -0 "$pid" 2>/dev/null; then
      info "Stopping $name (PID $pid)..."
      kill_tree "$pid"
      ok "$name stopped"
    else
      warn "$name is not running (stale PID $pid)"
    fi
    rm -f "$pidfile"
  else
    warn "No PID file for $name"
  fi
}

# ── Helper: stop whatever is holding a port (fallback) ───────
stop_by_port() {
  local name="$1" port="$2"
  local pids; pids="$(lsof -i :"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    info "Freeing port $port ($name)..."
    for pid in $pids; do
      kill_tree "$pid"
    done
    ok "Port $port freed"
  fi
}

# ── 1) Stop via PID files ────────────────────────────────────
stop_by_pidfile "Frontend (Vite)"       "$PID_DIR/frontend.pid"
stop_by_pidfile "Backend (Spring Boot)" "$PID_DIR/backend.pid"

# ── 2) Fallback cleanup via ports ────────────────────────────
stop_by_port "Frontend" "$FRONTEND_PORT"
stop_by_port "Backend"  "$BACKEND_PORT"

echo "============================================================"
ok "Project stopped completely"
echo "============================================================"
