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
        return {
            'principalId': user_id,
            'policyDocument': {
                'Version': '2012-10-17',
                'Statement': [
                    {
                        'Action': 'execute-api:Invoke',
                        'Effect': 'Allow',
                        'Resource': event['methodArn']
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
        
        # Fetch Cognito public keys
        public_keys = get_cognito_public_keys()
        
        if kid not in public_keys:
            raise Exception(f'Invalid token: Unknown kid {kid}')
        
        # Verify and decode JWT
        public_key = public_keys[kid]
        claims = jwt.decode(
            token,
            public_key,
            algorithms=['RS256'],
            audience=COGNITO_APP_CLIENT_ID,
            options={
                'verify_signature': True,
                'verify_aud': False,  # AWS SDK doesn't set aud claim for user pools
                'verify_iat': True
            }
        )
        
        # Verify token is from correct user pool
        if claims.get('iss') != f'https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}':
            raise Exception('Invalid token: Wrong issuer')
        
        return claims
    
    except JWTError as e:
        raise Exception(f'JWT validation failed: {str(e)}')
    except Exception as e:
        raise Exception(f'Token validation error: {str(e)}')


def get_cognito_public_keys():
    """
    Fetch Cognito public keys (JWK format)
    Caches keys for 1 hour to reduce API calls
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
        
        # Convert JWK to usable public keys (kid -> key mapping)
        public_keys = {}
        for key in jwk_set['keys']:
            kid = key['kid']
            # Use python-jose to convert JWK to public key format
            from jose.backends.rsa_backend import RSAKey
            public_keys[kid] = RSAKey(key)
        
        # Cache the keys
        keys_cache = public_keys
        keys_cache_time = current_time
        
        return public_keys
    
    except Exception as e:
        print(f"Error fetching Cognito JWK: {str(e)}")
        # Return cached keys as fallback, even if expired
        if keys_cache:
            return keys_cache
        raise Exception('Unable to validate token: Could not fetch Cognito keys')
