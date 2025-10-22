"""
Lambda: medication-scheduler
Purpose: CRUD operations for user medications (create, read, update, delete)
Handles reminders, scheduling, and medication tracking
"""

import json
import boto3
from datetime import datetime, timedelta

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name='us-west-1')

# DynamoDB table reference
medications_table = dynamodb.Table('Medications')


def lambda_handler(event, context):
    """
    Main Lambda handler for medication operations
    Routes based on HTTP method and path
    """
    try:
        # Get HTTP method - handle both direct and nested structures
        http_method = event.get('httpMethod', 'GET')

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
        
        # Route to appropriate handler
        if http_method == 'POST':
            return create_medication(user_id, body)
        elif http_method == 'GET':
            medication_id = event.get('pathParameters', {}).get('medicationId')
            if medication_id:
                return get_medication(user_id, medication_id)
            else:
                return list_medications(user_id)
        elif http_method == 'PUT':
            medication_id = event.get('pathParameters', {}).get('medicationId')
            return update_medication(user_id, medication_id, body)
        elif http_method == 'DELETE':
            medication_id = event.get('pathParameters', {}).get('medicationId')
            return delete_medication(user_id, medication_id)
        else:
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def create_medication(user_id, body):
    """
    Create a new medication entry
    Expected body: {name, dosage, frequency, startDate, endDate, reminders, notes}
    """
    try:
        required_fields = ['name', 'dosage', 'frequency']
        if not all(field in body for field in required_fields):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'Required fields: {", ".join(required_fields)}'})
            }
        
        medication_id = f"med-{int(datetime.now().timestamp() * 1000000)}"
        timestamp = int(datetime.now().timestamp() * 1000)
        
        item = {
            'userId': user_id,
            'medicationId': medication_id,
            'name': body.get('name').strip(),
            'dosage': body.get('dosage').strip(),
            'frequency': body.get('frequency').strip(),  # e.g., "twice daily", "every 8 hours"
            'startDate': body.get('startDate', datetime.now().isoformat()),
            'endDate': body.get('endDate', ''),
            'reminders': body.get('reminders', []),  # Array of times, e.g., ["08:00", "20:00"]
            'notes': body.get('notes', ''),
            'active': True,
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        medications_table.put_item(Item=item)

        # For AWS integration type, return data directly
        return {
            'medicationId': medication_id,
            'message': f'Medication "{item["name"]}" created successfully'
        }

    except Exception as e:
        print(f"Create error: {str(e)}")
        return {'error': str(e)}


def list_medications(user_id):
    """
    List all medications for a user
    """
    try:
        response = medications_table.query(
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={':uid': user_id}
        )

        items = response.get('Items', [])

        # For AWS integration type, return data directly
        return {
            'medications': items,
            'count': len(items)
        }

    except Exception as e:
        print(f"List error: {str(e)}")
        return {'error': str(e)}


def get_medication(user_id, medication_id):
    """
    Get a single medication by ID
    """
    try:
        response = medications_table.get_item(
            Key={
                'userId': user_id,
                'medicationId': medication_id
            }
        )

        if 'Item' not in response:
            return {'error': 'Medication not found'}

        # For AWS integration type, return data directly
        return response['Item']

    except Exception as e:
        print(f"Get error: {str(e)}")
        return {'error': str(e)}


def update_medication(user_id, medication_id, body):
    """
    Update an existing medication
    """
    try:
        if not medication_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'medicationId is required'})
            }
        
        timestamp = int(datetime.now().timestamp() * 1000)
        
        # Build update expression
        update_expr = "SET updatedAt = :ts"
        expr_values = {':ts': timestamp}
        
        # Only update provided fields
        if 'name' in body:
            update_expr += ", #name = :name"
            expr_values[':name'] = body['name']
            expr_values['#name'] = 'name'  # name is reserved keyword
        
        if 'dosage' in body:
            update_expr += ", dosage = :dosage"
            expr_values[':dosage'] = body['dosage']
        
        if 'frequency' in body:
            update_expr += ", frequency = :freq"
            expr_values[':freq'] = body['frequency']
        
        if 'reminders' in body:
            update_expr += ", reminders = :reminders"
            expr_values[':reminders'] = body['reminders']
        
        if 'active' in body:
            update_expr += ", active = :active"
            expr_values[':active'] = body['active']
        
        response = medications_table.update_item(
            Key={
                'userId': user_id,
                'medicationId': medication_id
            },
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
            ReturnValues='ALL_NEW'
        )

        # For AWS integration type, return data directly
        return {
            'medication': response['Attributes'],
            'message': 'Medication updated successfully'
        }

    except Exception as e:
        print(f"Update error: {str(e)}")
        return {'error': str(e)}


def delete_medication(user_id, medication_id):
    """
    Delete a medication (soft delete via active flag recommended)
    """
    try:
        if not medication_id:
            return {'error': 'medicationId is required'}

        medications_table.delete_item(
            Key={
                'userId': user_id,
                'medicationId': medication_id
            }
        )

        # For AWS integration type, return data directly
        return {'message': 'Medication deleted successfully'}

    except Exception as e:
        print(f"Delete error: {str(e)}")
        return {'error': str(e)}
