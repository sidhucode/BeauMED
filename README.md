# BeauMED

A comprehensive health companion mobile application built with React Native and AWS serverless architecture.

## Overview

BeauMED is a healthcare management application that provides users with personalized health assistance, medication tracking, doctor search functionality, and prescription analysis powered by advanced cloud services.

## Features

### Core Functionality
- **User Authentication**: Secure sign-up, login, password reset, and email verification via AWS Cognito
- **AI Health Assistant**: Conversational health guidance powered by Amazon Bedrock (Nova models)
- **Medication Management**: Full CRUD operations for medication tracking with reminder scheduling
- **Doctor Search**: Location-based doctor search with Google Maps Places API integration
- **Prescription Upload**: Camera/photo library integration with AI-powered prescription analysis
- **Profile Management**: User profile with emergency contact information stored in Cognito
- **Dark Mode**: System-wide theme support with light/dark mode toggle
- **Web Preview**: Browser-based development preview for rapid UI iteration

### Authentication Features
- Sign-up with email verification (6-digit code)
- Secure login with JWT token management
- Password reset with email verification
- Auto-verified email attributes
- Protected routes requiring authentication

### Health Assistant
- Real-time conversational AI chat
- Conversation history stored in DynamoDB
- Context-aware health guidance
- Streaming responses for better UX

### Medications
- Add, edit, and delete medications
- Multiple reminder times per medication
- Start/end date tracking
- Active/inactive status
- Notes field for additional information
- Integration with AWS DynamoDB for persistence

### Doctor Search
- Search by city or medical specialty
- Distance calculation from user location
- Rating display and contact information
- Direct calling via deep links
- Google Maps directions integration

### Prescription Analysis
- Camera capture or photo library upload
- Secure S3 presigned URL uploads
- AI-powered prescription text extraction
- Automatic medication creation from prescriptions

## Tech Stack

### Frontend
- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Navigation**: Custom SimpleRouter
- **State Management**: React Context API (Theme, Medications, Profile, Notifications)
- **UI**: React Native components with custom theming
- **Web Support**: react-dom and react-native-web for browser preview

### Backend (AWS)
- **Authentication**: AWS Cognito (User Pools, Identity Pools)
- **API Gateway**: REST API with JWT authorization
- **Lambda Functions**: Python-based serverless functions
  - bedrock-chat-handler (AI chat)
  - medication-scheduler (CRUD operations)
  - prescription-analyzer (AI prescription analysis)
  - s3-presigner (secure upload URLs)
  - doctor-finder (location-based search)
  - cognito-jwt-authorizer (custom authorizer)
- **Database**: DynamoDB (medications, conversations, prescriptions)
- **Storage**: S3 (prescription images)
- **AI/ML**: Amazon Bedrock (Nova models for chat and analysis)

### External Services
- **Google Maps Places API**: Doctor search and location services

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- AWS Account with configured credentials
- Google Maps API key
- iOS Simulator (macOS) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BeauMED/BeauMED/ExpoApp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the ExpoApp directory:
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Start the development server:
```bash
# Local network
npx expo start

# With tunnel (for remote devices)
npx expo start --tunnel

# Platform-specific
npx expo start --ios
npx expo start --android
npx expo start --web
```

### AWS Configuration

The application requires the following AWS resources to be configured:

**Cognito:**
- User Pool with email verification enabled
- App Client with `ALLOW_USER_PASSWORD_AUTH` enabled
- Identity Pool for AWS resource access
- Custom attributes: `custom:age`, `custom:conditions`, `custom:caregiver_name`, `custom:caregiver_phone`, `custom:caregiver_email`

**API Gateway:**
- REST API with CORS enabled
- JWT authorizer using Cognito User Pool
- Endpoints: `/chat`, `/medications`, `/get-upload-url`, `/analyze-prescription`, `/find-doctors`

**DynamoDB Tables:**
- `Medications` (userId, medicationId)
- `ConversationHistory` (userId, timestamp)
- `Prescriptions` (userId, prescriptionId)

**S3 Bucket:**
- Public read disabled
- Presigned URL upload policy
- Path structure: `prescriptions/{userId}/{timestamp}/`

**Lambda Functions:**
- Deployed with appropriate IAM roles
- Environment variables configured
- Bedrock model access enabled

## Running the Application

### Development Mode

```bash
# Start Expo server
cd ExpoApp
npx expo start

# In a separate terminal, open in iOS simulator
npx expo start --ios

# Or Android emulator
npx expo start --android

# Or web browser
npx expo start --web
```

### Testing Authentication

Test account credentials:
- Email: test@beaumed.com
- Password: TestPass123!

### AWS CLI Utilities

**Check user status:**
```bash
aws cognito-idp admin-get-user \
  --user-pool-id us-west-1_7zPgpiXeY \
  --username <email> \
  --region us-west-1
```

**Confirm user:**
```bash
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id us-west-1_7zPgpiXeY \
  --username <email> \
  --region us-west-1
```

**Set password:**
```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id us-west-1_7zPgpiXeY \
  --username <email> \
  --password "<password>" \
  --permanent \
  --region us-west-1
```

## Architecture

### Authentication Flow
1. User signs up with email, name, phone, and password
2. Cognito sends verification code to email
3. User enters code to verify email
4. User logs in with email and password
5. Cognito returns JWT tokens (ID token, access token, refresh token)
6. Frontend stores tokens and uses ID token for API requests
7. API Gateway validates JWT using custom authorizer

### API Request Flow
1. Frontend calls AWS Amplify API methods
2. Amplify automatically attaches JWT token to request headers
3. API Gateway receives request and invokes authorizer Lambda
4. Authorizer validates JWT against Cognito JWK endpoint
5. If valid, API Gateway invokes target Lambda function
6. Lambda processes request and accesses AWS resources (DynamoDB, S3, Bedrock)
7. Response returned through API Gateway to frontend

### Prescription Upload Flow
1. User selects image from camera or photo library
2. Frontend requests presigned URL from `/get-upload-url` endpoint
3. S3 presigner Lambda generates secure upload URL
4. Frontend uploads image directly to S3 using presigned POST
5. Frontend calls `/analyze-prescription` with S3 key
6. Prescription analyzer Lambda downloads image from S3
7. Bedrock analyzes image and extracts medication information
8. Medications are saved to DynamoDB
9. Frontend refreshes medication list

## Security

- All API endpoints require JWT authentication
- Presigned S3 URLs expire after 1 hour
- User data isolated by `userId` from JWT claims
- File type and size validation on uploads
- No hardcoded credentials in source code
- Environment variables for sensitive configuration
- CORS properly configured for Expo app origin

## Development Tools

### AWS Service Health Monitoring
Development-only banner that tracks AWS service status:
- Monitors API Gateway, Cognito, Lambda, DynamoDB, S3, Bedrock
- Automatic error classification (operational/degraded/down)
- Real-time status updates with detailed logs
- Export logs to console for debugging

### Web Preview
Browser-based preview for faster UI development:
```bash
npx expo start --web
```
Access at http://localhost:8081

## Known Issues

1. **Cross-region setup**: Cognito is in us-west-1, API Gateway in us-east-1 (intentional but can cause confusion)
2. **Cognito rate limiting**: Password reset and sign-up verification have rate limits (wait 15-30 minutes between attempts)
3. **CORS errors**: Expected when API Gateway endpoints are not yet deployed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper testing
4. Submit a pull request with detailed description

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.

---

**Version**: 1.0.0 (MVP)
**Last Updated**: January 2025
**Status**: Active Development
