#!/bin/bash
echo "=== Health Endpoint Verification ==="
echo "Date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Host: $(hostname)"
echo ""

echo "--- Step 1: 5 Consecutive Health Endpoint Checks ---"
PASS=0
for i in 1 2 3 4 5; do
  HTTP_CODE=$(curl -s -o /tmp/health_response_$i.txt -w '%{http_code}' http://localhost:3000/health)
  BODY=$(cat /tmp/health_response_$i.txt)
  echo "Check $i: HTTP $HTTP_CODE | Response: $BODY"
  if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"status":"ok"'; then
    PASS=$((PASS + 1))
  fi
  sleep 1
done
echo "Result: $PASS/5 passed"
echo ""

echo "--- Step 2: Process Verification ---"
echo "Listening on port 3000:"
ss -tlnp 2>/dev/null | grep ':3000' || netstat -tlnp 2>/dev/null | grep ':3000' || echo "(ss/netstat not available, but curl succeeds)"
echo ""
echo "Node processes:"
ps aux 2>/dev/null | grep -E 'node|npm' | grep -v grep || echo "(ps not available)"
echo ""

echo "--- Step 3: Platform Health API ---"
echo "(Checked via Paperclip API separately)"
echo ""

echo "=== Verification Complete ==="
if [ "$PASS" -eq 5 ]; then
  echo "RESULT: PASS - All 5 consecutive health checks returned HTTP 200 with {status: ok}"
  exit 0
else
  echo "RESULT: FAIL - Only $PASS/5 checks passed"
  exit 1
fi
