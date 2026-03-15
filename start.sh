#!/bin/sh
# Simple process supervisor that restarts the app if it crashes
MAX_RETRIES=5
RETRY_COUNT=0

while true; do
  echo "[$(date)] Starting demo-app..."
  node src/index.js
  EXIT_CODE=$?
  echo "[$(date)] App exited with code $EXIT_CODE."

  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "[$(date)] Max retries ($MAX_RETRIES) reached. Stopping."
    exit 1
  fi

  sleep 2
  # Reset retry count if the app ran for at least 10 seconds
done
