#!/bin/sh
# Simple process supervisor that restarts the app if it crashes
while true; do
  echo "[$(date)] Starting demo-app..."
  node src/index.js
  EXIT_CODE=$?
  echo "[$(date)] App exited with code $EXIT_CODE. Restarting in 2 seconds..."
  sleep 2
done
