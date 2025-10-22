#!/bin/bash
# Get a fresh JWT token from a test login
# This assumes you have aws-amplify configured

# For now, let's just check the API structure
echo "Testing DELETE endpoint structure..."
curl -v -X DELETE \
  "https://dchf2ja7ti.execute-api.us-east-1.amazonaws.com/dev/medications/test-id" \
  -H "Authorization: Bearer fake-token-for-testing" \
  2>&1 | grep -E "< HTTP|< Content-Type|^{|error|Unauthorized"
