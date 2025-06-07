#!/bin/bash

# Kill any processes running on ports 3000 and 5173
kill -9 $(lsof -ti:3000) >/dev/null 2>&1 || true
kill -9 $(lsof -ti:5173) >/dev/null 2>&1 || true

# Start both backend and frontend with mixed logs for local testing

# Move to repo root
cd "$(dirname "$0")"

# Start both apps in parallel, mixing logs
pnpm --filter @familyfoto/server dev &
SERVER_PID=$!
pnpm --filter web dev &
WEB_PID=$!

# Wait for both to exit
wait $SERVER_PID
wait $WEB_PID 