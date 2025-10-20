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
        user_id = event['requestContext']['authorizer']['claims']['sub']  # From Cognito JWT
        http_method = event['httpMethod']
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        
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
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'medicationId': medication_id,
                'message': f'Medication "{item["name"]}" created successfully'
            })
        }
    
    except Exception as e:
        print(f"Create error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


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
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'medications': items,
                'count': len(items)
            })
        }
    
    except Exception as e:
        print(f"List error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


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
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Medication not found'})
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response['Item'])
        }
    
    except Exception as e:
        print(f"Get error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


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
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'medication': response['Attributes'],
                'message': 'Medication updated successfully'
            })
        }
    
    except Exception as e:
        print(f"Update error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def delete_medication(user_id, medication_id):
    """
    Delete a medication (soft delete via active flag recommended)
    """
    try:
        if not medication_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'medicationId is required'})
            }
        
        medications_table.delete_item(
            Key={
                'userId': user_id,
                'medicationId': medication_id
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'message': 'Medication deleted successfully'})
        }
    
    except Exception as e:
        print(f"Delete error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
