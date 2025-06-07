#!/bin/bash

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