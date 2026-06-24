#!/usr/bin/env bash
# =============================================================
#  Hospital Management System (HMS) — START SCRIPT
#  Starts the Database check + Backend (Spring Boot) + Frontend (Vite)
# =============================================================

set -euo pipefail

# ── Project paths ────────────────────────────────────────────
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/Back-End/Back-End/hospital-management-system-main"
FRONTEND_DIR="$ROOT_DIR/Front-End/HMS_Front"
LOG_DIR="$ROOT_DIR/.run/logs"
PID_DIR="$ROOT_DIR/.run/pids"

# ── Settings ─────────────────────────────────────────────────
DB_NAME="hms_backend"
DB_USER="root"
DB_PASS="root"
BACKEND_PORT=8080
FRONTEND_PORT=5173

mkdir -p "$LOG_DIR" "$PID_DIR"

# ── Colors ───────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[ OK ]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[FAIL]${NC} $1"; }

# ── Helper: check if a port is in use ────────────────────────
is_port_in_use() {
  lsof -i :"$1" -sTCP:LISTEN -t >/dev/null 2>&1
}

echo "============================================================"
echo "   Hospital Management System (HMS) - START"
echo "============================================================"

# ── 1) Check prerequisites ───────────────────────────────────
info "Checking prerequisites..."
command -v java  >/dev/null 2>&1 || { err "Java is not installed"; exit 1; }
command -v mvn   >/dev/null 2>&1 || { err "Maven is not installed"; exit 1; }
command -v node  >/dev/null 2>&1 || { err "Node.js is not installed"; exit 1; }
command -v npm   >/dev/null 2>&1 || { err "npm is not installed"; exit 1; }
ok "All prerequisites are available"

# ── 2) Ensure the database exists ────────────────────────────
info "Checking MySQL database..."
if command -v mysql >/dev/null 2>&1; then
  if mysql -u"$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >/dev/null 2>&1; then
    ok "Database '$DB_NAME' is ready"
  else
    warn "Could not connect to MySQL with $DB_USER/$DB_PASS — make sure MySQL is running with correct credentials"
    warn "Continuing, assuming the database already exists..."
  fi
else
  warn "mysql command not found — skipping database check"
fi

# ── 3) Start the Backend ─────────────────────────────────────
if is_port_in_use "$BACKEND_PORT"; then
  warn "Port $BACKEND_PORT is already in use — skipping Backend startup"
else
  info "Starting Backend (Spring Boot) on port $BACKEND_PORT..."
  cd "$BACKEND_DIR"
  nohup mvn spring-boot:run > "$LOG_DIR/backend.log" 2>&1 &
  echo $! > "$PID_DIR/backend.pid"
  ok "Backend started — PID $(cat "$PID_DIR/backend.pid") | log: $LOG_DIR/backend.log"
fi

# ── 4) Prepare and start the Frontend ────────────────────────
if is_port_in_use "$FRONTEND_PORT"; then
  warn "Port $FRONTEND_PORT is already in use — skipping Frontend startup"
else
  cd "$FRONTEND_DIR"
  if [ ! -d "node_modules" ]; then
    info "Installing Frontend dependencies (npm install) for the first time..."
    npm install
    ok "Dependencies installed"
  fi
  info "Starting Frontend (Vite) on port $FRONTEND_PORT..."
  nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
  echo $! > "$PID_DIR/frontend.pid"
  ok "Frontend started — PID $(cat "$PID_DIR/frontend.pid") | log: $LOG_DIR/frontend.log"
fi

echo "============================================================"
ok "Project started successfully"
echo ""
echo "   Frontend  : http://localhost:$FRONTEND_PORT"
echo "   Backend   : http://localhost:$BACKEND_PORT"
echo "   API Docs  : http://localhost:$BACKEND_PORT/swagger-ui.html"
echo ""
echo "   Admin login:"
echo "      username : superadmin"
echo "      password : SuperAdmin@123"
echo ""
echo "   Note: the Backend may take 1-2 minutes on first run to download dependencies."
echo "   Follow logs: tail -f $LOG_DIR/backend.log"
echo "   Stop project: ./stop.sh"
echo "============================================================"
