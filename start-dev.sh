#!/bin/bash

# =====================================================
# Task Avatar AI - Development Startup Script
# =====================================================

echo "🚀 Starting Task Avatar AI Development Environment..."

# 1. Start Voicevox via Docker Compose
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "--> Starting Voicevox (Docker)..."
    docker compose up -d
else
    echo "⚠️  Warning: Docker Compose not found. Voicevox might not be available."
fi

# 2. Check dependencies and Start Backend (Express)
echo "--> Starting Backend (Express on port 3000)..."
if [ ! -d "server/node_modules" ]; then
    echo "    (Installing backend dependencies...)"
    (cd server && npm install --silent)
fi
(cd server && npm run dev) &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# 3. Check dependencies and Start Frontend (Vite)
echo "--> Starting Frontend (Vite on port 5173)..."
if [ ! -d "client/node_modules" ]; then
    echo "    (Installing frontend dependencies...)"
    (cd client && npm install --silent)
fi
(cd client && npm run dev) &
FRONTEND_PID=$!

# --- Cleanup Function ---
function cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    
    # Optional: Stop Voicevox container as well
    # echo "--> Stopping Voicevox..."
    # docker compose stop
    
    echo "✅ Shutdown complete."
    exit 0
}

# Trap signals for cleanup
trap cleanup SIGINT SIGTERM

echo "====================================================="
echo "✅ All systems are running!"
echo "🌐 User Interface:  http://localhost:5173"
echo "⚙️  Admin Panel:     http://localhost:5173/admin.html"
echo "🔊 Voicevox API:    http://localhost:50021/docs"
echo "====================================================="
echo "⌨️  Press [Ctrl+C] to shut down all servers."
echo "====================================================="

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
