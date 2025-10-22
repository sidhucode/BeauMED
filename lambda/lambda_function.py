"""
Lambda: s3-presigner
Purpose: Generate presigned URLs for direct S3 file uploads (prescriptions, documents)
Provides secure, time-limited upload access without exposing AWS credentials
"""

import json
import boto3
from datetime import datetime
import uuid

# Initialize AWS clients
s3 = boto3.client('s3', region_name='us-west-1')


def lambda_handler(event, context):
    """
    Main Lambda handler for presigned URL generation
    """
    try:
        # Parse request body - handles both direct body and nested body structure
        if isinstance(event.get('body'), str):
            body = json.loads(event.get('body', '{}'))
        elif isinstance(event.get('body'), dict):
            body = event.get('body', {})
        else:
            body = {}

        # Get user_id from authorizer context (handles both AWS and AWS_PROXY integration types)
        try:
            # AWS_PROXY integration type
            user_id = event['requestContext']['authorizer']['claims']['sub']
        except (KeyError, TypeError):
            # AWS integration type - authorizer context is in different location
            user_id = event['requestContext']['authorizer'].get('sub') or event['requestContext']['authorizer'].get('principalId')

        if not user_id:
            return {'error': 'Unauthorized - missing user ID'}

        file_type = body.get('file_type', 'image').strip()  # 'image', 'document', 'medical-record'
        file_name = body.get('file_name', '').strip()

        # Validate inputs
        if not file_name:
            return {'error': 'file_name is required'}

        # Security: only allow certain file types
        allowed_types = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp']
        content_type = body.get('content_type', 'image/jpeg').strip()
        if content_type not in allowed_types:
            return {'error': f'Content type not allowed. Allowed: {", ".join(allowed_types)}'}
        
        # Generate S3 key with user isolation
        file_extension = file_name.split('.')[-1] if '.' in file_name else ''
        unique_id = str(uuid.uuid4())[:8]
        s3_key = f"prescriptions/{user_id}/{file_type}/{unique_id}.{file_extension}"
        
        # Generate presigned POST (for browser uploads)
        presigned_post = generate_presigned_post(
            s3_key=s3_key,
            content_type=content_type,
            max_file_size=5 * 1024 * 1024  # 5MB max
        )
        
        # Also generate presigned GET URL for retrieval (1 hour expiry)
        presigned_get = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': 'beaumed-prescriptions',
                'Key': s3_key
            },
            ExpiresIn=3600  # 1 hour
        )

        # For AWS integration type, return data directly
        return {
            's3_key': s3_key,
            'presigned_post': presigned_post,  # For direct browser uploads
            'presigned_get': presigned_get,    # For retrieving the file
            'message': f'Presigned URL generated for {file_name}'
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {'error': str(e)}


def generate_presigned_post(s3_key, content_type, max_file_size):
    """
    Generate a presigned POST policy for direct browser uploads
    More secure than PUT: enforces file size, content type, expiry time
    """
    try:
        response = s3.generate_presigned_post(
            Bucket='beaumed-prescriptions',
            Key=s3_key,
            Fields={
                'Content-Type': content_type
            },
            Conditions=[
                ['content-length-range', 0, max_file_size],
                {'Content-Type': content_type}
            ],
            ExpiresIn=3600  # 1 hour expiry
        )
        return response
    
    except Exception as e:
        print(f"Presigned POST error: {str(e)}")
        raise


def verify_file_ownership(user_id, s3_key):
    """
    Helper: Verify that an S3 key belongs to the requesting user
    (prevents users from accessing each other's files)
    """
    expected_prefix = f"prescriptions/{user_id}/"
    return s3_key.startswith(expected_prefix)


def get_s3_object_metadata(s3_key):
    """
    Helper: Get metadata about an S3 object (size, date uploaded, etc.)
    Useful for listing user files
    """
    try:
        response = s3.head_object(
            Bucket='beaumed-prescriptions',
            Key=s3_key
        )
        return {
            'size': response['ContentLength'],
            'last_modified': response['LastModified'].isoformat(),
            'content_type': response['ContentType']
        }
    except Exception as e:
        print(f"Metadata error: {str(e)}")
        return None
