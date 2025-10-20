"""
Lambda: doctor-finder
Purpose: Find doctors near user location using Yelp API
Receives: location, specialty (optional)
Returns: List of doctors with details (name, phone, address, rating)
"""

import json
import boto3
import requests
from datetime import datetime

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name='us-west-1')
secrets_manager = boto3.client('secretsmanager', region_name='us-west-1')

# DynamoDB table reference
doctors_table = dynamodb.Table('Doctors')


def lambda_handler(event, context):
    """
    Main Lambda handler for doctor discovery
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        user_id = event['requestContext']['authorizer']['claims']['sub']  # From Cognito JWT
        location = body.get('location', '').strip()
        specialty = body.get('specialty', 'doctor').strip()
        
        if not location:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Location is required'})
            }
        
        # Retrieve Yelp API key from Secrets Manager
        try:
            secret = secrets_manager.get_secret_value(SecretId='beaumed/yelp-api-key')
            yelp_api_key = secret['SecretString']
        except Exception as e:
            print(f"Warning: Could not retrieve Yelp API key: {str(e)}")
            yelp_api_key = None
        
        doctors = []
        
        if yelp_api_key:
            # Search Yelp API for doctors
            doctors = search_yelp_doctors(yelp_api_key, location, specialty)
        else:
            # Fallback: Return mock data (for testing without Yelp key)
            doctors = get_mock_doctors(location)
        
        # Save doctors to user's Doctors table (bookmarking)
        timestamp = int(datetime.now().timestamp() * 1000)
        for doctor in doctors[:5]:  # Save top 5
            doctors_table.put_item(
                Item={
                    'userId': user_id,
                    'doctorId': f"doc-{doctor.get('id', timestamp)}",
                    'name': doctor.get('name', 'Unknown'),
                    'specialty': specialty,
                    'phone': doctor.get('phone', 'N/A'),
                    'address': doctor.get('address', 'N/A'),
                    'rating': doctor.get('rating', 0),
                    'website': doctor.get('website', ''),
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
                'doctors': doctors,
                'count': len(doctors),
                'message': f'Found {len(doctors)} doctors in {location}'
            })
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def search_yelp_doctors(api_key, location, specialty):
    """
    Query Yelp API for doctors
    """
    try:
        url = "https://api.yelp.com/v3/businesses/search"
        headers = {"Authorization": f"Bearer {api_key}"}
        params = {
            "location": location,
            "term": f"{specialty}",
            "categories": "physicians,doctors",
            "sort_by": "rating",
            "limit": 10
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        doctors = []
        
        for business in data.get('businesses', []):
            doctors.append({
                'id': business.get('id'),
                'name': business.get('name'),
                'phone': business.get('phone', ''),
                'address': ', '.join(business.get('location', {}).get('display_address', [])),
                'rating': business.get('rating', 0),
                'website': business.get('url', ''),
                'latitude': business.get('coordinates', {}).get('latitude'),
                'longitude': business.get('coordinates', {}).get('longitude')
            })
        
        return doctors
    
    except Exception as e:
        print(f"Yelp API error: {str(e)}")
        return []


def get_mock_doctors(location):
    """
    Fallback mock data when Yelp API is unavailable
    """
    return [
        {
            'id': 'mock-1',
            'name': 'Dr. Sarah Chen, MD',
            'specialty': 'General Practice',
            'phone': '(555) 123-4567',
            'address': f'123 Medical Plaza, {location}',
            'rating': 4.8,
            'website': 'https://example.com/drchen'
        },
        {
            'id': 'mock-2',
            'name': 'Dr. James Mitchell, MD',
            'specialty': 'General Practice',
            'phone': '(555) 234-5678',
            'address': f'456 Health Center, {location}',
            'rating': 4.5,
            'website': 'https://example.com/drmitchell'
        },
        {
            'id': 'mock-3',
            'name': 'Dr. Elena Rodriguez, MD',
            'specialty': 'Cardiology',
            'phone': '(555) 345-6789',
            'address': f'789 Clinic Way, {location}',
            'rating': 4.9,
            'website': 'https://example.com/drrodriguez'
        }
    ]
