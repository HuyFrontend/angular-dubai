#!/bin/bash
FILES=/app/public/*.js

ESCAPED_SERVICES_ENDPOINT=$(echo "$SERVICES_ENDPOINT" | sed -e 's/[]\/$*.^|[]/\\&/g')
ESCAPED_FO_URL=$(echo "$FO_URL" | sed -e 's/[]\/$*.^|[]/\\&/g')

for f in $FILES
do
  echo "Processing $f file..."
  sed -i "s/{{API_URL}}/${ESCAPED_SERVICES_ENDPOINT}/g" $f
  sed -i "s/{{FO_URL}}/${ESCAPED_FO_URL}/g" $f

done

cd /app && node server.js
