#!/bin/sh
# Tell Bing (and other IndexNow search engines) that pages changed, right after a push goes live.
# Usage: tools/indexnow.sh                 -> every URL in sitemap.xml
#        tools/indexnow.sh URL [URL ...]   -> just those pages
# The key file (32 hex characters + .txt) sits at the site root and must be live before this runs.
cd "$(dirname "$0")/.." || exit 1
HOST=flagfootballillustrated.com
KEY=$(ls | grep -E '^[0-9a-f]{32}\.txt$' | head -1 | sed 's/\.txt$//')
[ -n "$KEY" ] || { echo "No IndexNow key file found"; exit 1; }
if [ $# -gt 0 ]; then URLS="$*"; else URLS=$(grep -o '<loc>[^<]*' sitemap.xml | sed 's/<loc>//'); fi
LIST=$(printf '%s\n' $URLS | sed 's/.*/"&"/' | paste -sd, -)
curl -s -o /dev/null -w "IndexNow: HTTP %{http_code}\n" -X POST https://api.indexnow.org/indexnow \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"$HOST\",\"key\":\"$KEY\",\"keyLocation\":\"https://$HOST/$KEY.txt\",\"urlList\":[$LIST]}"
