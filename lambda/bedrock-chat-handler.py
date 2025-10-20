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
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        user_id = event['requestContext']['authorizer']['claims']['sub']  # From Cognito JWT
        user_message = body.get('message', '').strip()
        
        if not user_message:
            return {
                'statusCode': 400,
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
        
        # Build message history for Bedrock
        messages = []
        for item in reversed(history):  # Reverse to chronological order
            messages.append({
                'role': item['role'],
                'content': item['content']
            })
        
        # Add current user message
        messages.append({
            'role': 'user',
            'content': user_message
        })
        
        # Call Bedrock Nova model
        bedrock_response = bedrock.invoke_model(
            modelId='amazon.nova-pro',  # Using Nova Pro for better reasoning
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'messages': messages,
                'system': 'You are a helpful medical AI assistant for BeauMED. Provide accurate, safe health information. Always recommend consulting a healthcare provider for serious concerns. Keep responses concise and friendly.',
                'max_tokens': 500,
                'temperature': 0.7
            })
        )
        
        # Parse Bedrock response
        response_body = json.loads(bedrock_response['body'].read().decode('utf-8'))
        ai_message = response_body['content'][0]['text']
        
        # Save user message to DynamoDB
        timestamp = int(datetime.now().timestamp() * 1000)
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
                'timestamp': timestamp + 1,
                'role': 'assistant',
                'content': ai_message
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'response': ai_message,
                'timestamp': timestamp
            })
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
