"""
Lambda: bedrock-chat-handler
Purpose: Handle AI chat interactions with Bedrock Nova model
Receives: user message + chat history
Returns: AI response from Bedrock
"""

import json
import boto3
from datetime import datetime

# Initialize Bedrock client
bedrock = boto3.client('bedrock-runtime', region_name='us-west-1')
dynamodb = boto3.resource('dynamodb', region_name='us-west-1')

# DynamoDB table references
conversation_table = dynamodb.Table('ConversationHistory')


def lambda_handler(event, context):
    """
    Main Lambda handler for chat requests
    """
    try:
        # Parse request body - handles both direct body and nested body structure
        if isinstance(event.get('body'), str):
            # Body is a JSON string (AWS integration with template or AWS_PROXY)
            body = json.loads(event.get('body', '{}'))
        elif isinstance(event.get('body'), dict):
            # Body is already a dict (AWS integration without template)
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
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unauthorized - missing user ID'})
            }

        user_message = body.get('message', '').strip()
        
        if not user_message:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Message cannot be empty'})
            }
        
        # Fetch chat history from DynamoDB
        response = conversation_table.query(
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={':uid': user_id},
            ScanIndexForward=False,  # Most recent first
            Limit=10  # Last 10 messages for context
        )
        
        history = response.get('Items', [])
        
        # Build message history for Bedrock Nova (converse API format)
        messages = []
        for item in reversed(history):  # Reverse to chronological order
            messages.append({
                'role': item['role'],
                'content': [{'text': item['content']}]
            })

        # Add current user message
        messages.append({
            'role': 'user',
            'content': [{'text': user_message}]
        })
        
        # Call Bedrock Nova model
        bedrock_response = bedrock.invoke_model(
            modelId='us.amazon.nova-pro-v1:0',  # Using Nova Pro for better reasoning
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'messages': messages,
                'system': [{'text': 'You are a helpful medical AI assistant for BeauMED. Provide accurate, safe health information. Always recommend consulting a healthcare provider for serious concerns. Keep responses concise and friendly.'}],
                'inferenceConfig': {
                    'max_new_tokens': 500,
                    'temperature': 0.7
                }
            })
        )
        
        # Parse Bedrock response
        response_body = json.loads(bedrock_response['body'].read().decode('utf-8'))
        print(f"Bedrock response: {json.dumps(response_body)}")

        # Extract AI message from Nova response structure
        # Nova returns: {"output": {"message": {"role": "assistant", "content": [{"text": "..."}]}}}
        if 'output' in response_body and 'message' in response_body['output']:
            ai_message = response_body['output']['message']['content'][0]['text']
        elif 'content' in response_body:
            ai_message = response_body['content'][0]['text']
        else:
            raise Exception(f"Unexpected response structure: {json.dumps(response_body)}")
        
        # Save user message to DynamoDB
        timestamp = str(int(datetime.now().timestamp() * 1000))
        conversation_table.put_item(
            Item={
                'userId': user_id,
                'timestamp': timestamp,
                'role': 'user',
                'content': user_message
            }
        )

        # Save AI response to DynamoDB
        conversation_table.put_item(
            Item={
                'userId': user_id,
                'timestamp': str(int(timestamp) + 1),
                'role': 'assistant',
                'content': ai_message
            }
        )
        
        # For AWS integration type, return just the response data
        # API Gateway handles statusCode and headers via integration response
        response_data = {
            'response': ai_message,
            'timestamp': timestamp
        }
        print(f"Returning response: {json.dumps(response_data)}")
        return response_data
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
