#!/bin/bash
echo "🚀 Starting Task Avatar AI Development Servers..."
echo "--> Starting Backend (Express on port 3000)..."
(cd server && npm run dev) &
BACKEND_PID=$!
sleep 2
echo "--> Starting Frontend (Vite on port 5173)..."
(cd client && npm run dev) &
FRONTEND_PID=$!
function cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM
echo "====================================================="
echo "✅ Servers are running!"
echo "🌐 Open your browser and go to: http://localhost:5173"
echo "⌨️  Press [Ctrl+C] to shut down."
echo "====================================================="
wait $BACKEND_PID $FRONTEND_PID
