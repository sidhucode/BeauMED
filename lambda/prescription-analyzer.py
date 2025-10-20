"""
Lambda: prescription-analyzer
Purpose: Extract medication data from prescription images using AWS Textract
Receives: S3 image path
Returns: Extracted medication data (name, dosage, frequency, etc.)
"""

import json
import boto3
from datetime import datetime

# Initialize AWS clients
textract = boto3.client('textract', region_name='us-west-1')
dynamodb = boto3.resource('dynamodb', region_name='us-west-1')
s3 = boto3.client('s3', region_name='us-west-1')

# DynamoDB table references
prescription_table = dynamodb.Table('PrescriptionData')
medications_table = dynamodb.Table('Medications')


def lambda_handler(event, context):
    """
    Main Lambda handler for prescription image analysis
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        user_id = event['requestContext']['authorizer']['claims']['sub']  # From Cognito JWT
        s3_key = body.get('s3_key', '').strip()  # e.g., 'prescriptions/user123/image.jpg'
        
        if not s3_key:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'S3 key is required'})
            }
        
        # Call Textract to analyze the prescription image
        textract_response = textract.analyze_document(
            Document={
                'S3Object': {
                    'Bucket': 'beaumed-prescriptions',
                    'Name': s3_key
                }
            },
            FeatureTypes=['FORMS', 'TABLES']
        )
        
        # Extract text from Textract response
        extracted_text = []
        for block in textract_response['Blocks']:
            if block['BlockType'] == 'LINE':
                extracted_text.append(block.get('Text', ''))
        
        full_text = ' '.join(extracted_text)
        
        # Simple parsing (in production, use more sophisticated NLP)
        medications = parse_medications(full_text)
        
        # Store prescription data in DynamoDB
        prescription_id = f"rx-{int(datetime.now().timestamp() * 1000)}"
        timestamp = int(datetime.now().timestamp() * 1000)
        
        prescription_table.put_item(
            Item={
                'userId': user_id,
                'prescriptionId': prescription_id,
                'timestamp': timestamp,
                's3_key': s3_key,
                'extracted_text': full_text,
                'medications': medications
            }
        )
        
        # Add medications to Medications table
        for med in medications:
            medications_table.put_item(
                Item={
                    'userId': user_id,
                    'medicationId': f"med-{int(datetime.now().timestamp() * 1000000)}",
                    'name': med.get('name', 'Unknown'),
                    'dosage': med.get('dosage', 'Not specified'),
                    'frequency': med.get('frequency', 'Not specified'),
                    'prescriptionId': prescription_id,
                    'timestamp': timestamp
                }
            )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'prescriptionId': prescription_id,
                'medications': medications,
                'message': f'Successfully extracted {len(medications)} medications from prescription'
            })
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def parse_medications(text):
    """
    Simple medication parser (can be enhanced with ML)
    Looks for common medication names and dosages
    """
    medications = []
    
    # Common medication names (simplified)
    common_meds = {
        'metformin': 'Metformin',
        'lisinopril': 'Lisinopril',
        'atorvastatin': 'Atorvastatin',
        'aspirin': 'Aspirin',
        'ibuprofen': 'Ibuprofen',
        'amoxicillin': 'Amoxicillin',
    }
    
    text_lower = text.lower()
    
    for med_key, med_name in common_meds.items():
        if med_key in text_lower:
            # Try to extract dosage pattern (e.g., "500mg", "10mg")
            import re
            dosage_pattern = r'\d+\s*(mg|ml|g)'
            dosages = re.findall(dosage_pattern, text)
            
            medications.append({
                'name': med_name,
                'dosage': dosages[0] if dosages else 'Not specified',
                'frequency': 'Refer to prescription',  # Would need more parsing
                'source': 'extracted_from_image'
            })
    
    return medications
