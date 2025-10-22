import { fetchAuthSession } from 'aws-amplify/auth';
import { monitoredAPICall } from './awsServiceHealth';

export type PrescriptionUploadResult = {
  prescriptionId: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
};

/**
 * Get a presigned S3 upload URL from the backend
 */
export async function getPresignedUploadUrl(fileName: string, contentType: string): Promise<{
  s3_key: string;
  presigned_post: {
    url: string;
    fields: Record<string, string>;
  };
  presigned_get: string;
}> {
  const session = await fetchAuthSession();
  const token = session?.tokens?.idToken?.toString();

  const response = await monitoredAPICall(
    'API_GATEWAY',
    async () => {
      return await fetch('https://dchf2ja7ti.execute-api.us-east-1.amazonaws.com/dev/get-upload-url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: fileName,
          content_type: contentType,
          file_type: 'image',
        }),
      });
    },
    'us-east-1'
  );

  const data = await response.json() as any;
  return data;
}

/**
 * Upload image to S3 using presigned POST
 */
export async function uploadToS3(
  presignedPost: { url: string; fields: Record<string, string> },
  imageUri: string,
  contentType: string
): Promise<void> {
  // Read the file as blob
  const response = await fetch(imageUri);
  const blob = await response.blob();

  // Create FormData for multipart upload
  const formData = new FormData();

  // Add all presigned POST fields first
  Object.keys(presignedPost.fields).forEach(key => {
    formData.append(key, presignedPost.fields[key]);
  });

  // Add the file last
  formData.append('file', blob);

  // Upload to S3
  const uploadResponse = await fetch(presignedPost.url, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
  }
}

/**
 * Analyze the prescription image and extract medication data
 */
export async function analyzePrescription(s3Key: string): Promise<PrescriptionUploadResult> {
  const session = await fetchAuthSession();
  const token = session?.tokens?.idToken?.toString();

  const response = await monitoredAPICall(
    'API_GATEWAY',
    async () => {
      return await fetch('https://dchf2ja7ti.execute-api.us-east-1.amazonaws.com/dev/analyze-prescription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          s3_key: s3Key,
        }),
      });
    },
    'us-east-1'
  );

  const data = await response.json() as any;
  return {
    prescriptionId: data.prescriptionId,
    medications: data.medications || [],
  };
}

/**
 * Complete prescription upload flow:
 * 1. Get presigned URL
 * 2. Upload image to S3
 * 3. Analyze prescription
 */
export async function uploadPrescription(
  imageUri: string,
  fileName: string = 'prescription.jpg',
  onProgress?: (stage: string) => void
): Promise<PrescriptionUploadResult> {
  try {
    // Stage 1: Get presigned URL
    onProgress?.('Getting upload URL...');
    const contentType = 'image/jpeg';
    const { s3_key, presigned_post } = await getPresignedUploadUrl(fileName, contentType);

    // Stage 2: Upload to S3
    onProgress?.('Uploading image...');
    await uploadToS3(presigned_post, imageUri, contentType);

    // Stage 3: Analyze prescription
    onProgress?.('Analyzing prescription...');
    const result = await analyzePrescription(s3_key);

    onProgress?.('Complete!');
    return result;
  } catch (error) {
    console.error('Prescription upload error:', error);
    throw error;
  }
}
