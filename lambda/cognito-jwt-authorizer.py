"""
Lambda: cognito-jwt-authorizer
Purpose: Validate Cognito JWT tokens for API Gateway
Receives: Authorization header with JWT token
Returns: IAM policy (Allow/Deny) + context with user info
"""

import json
import boto3
import urllib.request
import time
from jose import jwt, JWTError

# Cognito configuration
COGNITO_REGION = 'us-west-1'
COGNITO_USER_POOL_ID = 'us-west-1_7zPgpiXeY'
COGNITO_APP_CLIENT_ID = '336nvcbgt4k5bv9ms0pt09vs8t'

# Cache for Cognito public keys (refreshed hourly)
keys_cache = {}
keys_cache_time = 0


def lambda_handler(event, context):
    """
    Main Lambda handler for JWT authorization
    """
    try:
        # Extract token from Authorization header
        auth_header = event.get('authorizationToken', '')
        if not auth_header.startswith('Bearer '):
            raise Exception('Unauthorized: Missing or invalid Authorization header')
        
        token = auth_header.split('Bearer ')[1].strip()
        
        # Decode and validate JWT
        claims = validate_jwt(token)
        
        # Extract user ID (sub claim from Cognito)
        user_id = claims.get('sub')
        if not user_id:
            raise Exception('Unauthorized: Missing sub claim')
        
        # Return Allow policy with context
        # Use wildcard resource to allow all methods in the API (avoids caching issues)
        resource_parts = event['methodArn'].split('/')
        base_arn = '/'.join(resource_parts[:2])  # arn:aws:execute-api:region:account:api-id/stage
        wildcard_resource = f"{base_arn}/*"

        return {
            'principalId': user_id,
            'policyDocument': {
                'Version': '2012-10-17',
                'Statement': [
                    {
                        'Action': 'execute-api:Invoke',
                        'Effect': 'Allow',
                        'Resource': wildcard_resource
                    }
                ]
            },
            'context': {
                'sub': user_id,
                'email': claims.get('email', ''),
                'name': claims.get('name', ''),
                'phone_number': claims.get('phone_number', '')
            }
        }
    
    except Exception as e:
        print(f"Authorization error: {str(e)}")
        # Return Deny policy on auth failure
        return {
            'principalId': 'unauthorized',
            'policyDocument': {
                'Version': '2012-10-17',
                'Statement': [
                    {
                        'Action': 'execute-api:Invoke',
                        'Effect': 'Deny',
                        'Resource': event['methodArn']
                    }
                ]
            }
        }


def validate_jwt(token):
    """
    Validate JWT token against Cognito public keys
    """
    try:
        # Get JWT header to extract kid (key ID)
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')

        if not kid:
            raise Exception('Invalid token: Missing kid')

        # Fetch Cognito public keys (as JWK dict)
        jwk_keys = get_cognito_jwk_keys()

        if kid not in jwk_keys:
            raise Exception(f'Invalid token: Unknown kid {kid}')

        # Get the matching JWK
        jwk = jwk_keys[kid]

        # Decode and verify JWT using the JWK directly
        claims = jwt.decode(
            token,
            jwk,
            algorithms=['RS256'],
            options={
                'verify_signature': True,
                'verify_aud': False,  # Cognito doesn't set aud claim for user pools
                'verify_iat': True,
                'verify_exp': True
            }
        )

        # Verify token is from correct user pool
        expected_iss = f'https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}'
        if claims.get('iss') != expected_iss:
            raise Exception(f'Invalid token: Wrong issuer. Expected {expected_iss}, got {claims.get("iss")}')

        return claims

    except JWTError as e:
        raise Exception(f'JWT validation failed: {str(e)}')
    except Exception as e:
        raise Exception(f'Token validation error: {str(e)}')


def get_cognito_jwk_keys():
    """
    Fetch Cognito public keys in JWK format
    Caches keys for 1 hour to reduce API calls
    Returns: dict mapping kid -> JWK dict
    """
    global keys_cache, keys_cache_time

    current_time = time.time()

    # Return cached keys if fresh (less than 1 hour old)
    if keys_cache and (current_time - keys_cache_time) < 3600:
        return keys_cache

    try:
        # Construct JWK URL for Cognito
        jwk_url = f'https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json'

        # Fetch JWK set from Cognito
        with urllib.request.urlopen(jwk_url, timeout=5) as response:
            jwk_set = json.loads(response.read().decode('utf-8'))

        # Create kid -> JWK mapping
        jwk_keys = {}
        for key in jwk_set['keys']:
            kid = key['kid']
            jwk_keys[kid] = key

        # Cache the keys
        keys_cache = jwk_keys
        keys_cache_time = current_time

        return jwk_keys

    except Exception as e:
        print(f"Error fetching Cognito JWK: {str(e)}")
        # Return cached keys as fallback, even if expired
        if keys_cache:
            return keys_cache
        raise Exception('Unable to validate token: Could not fetch Cognito keys')
