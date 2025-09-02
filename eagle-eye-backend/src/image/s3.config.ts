import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

export const s3Client = new S3Client({
  endpoint: process.env.SPACES_ENDPOINT!,
  forcePathStyle: false,
  region: process.env.SPACES_REGION!,
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!,
  },
});


export const S3_CONFIG = {
  BUCKET_NAME: process.env.SPACES_BUCKET!,
  REGION: process.env.SPACES_REGION!,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  FOLDER: 'uploads/'
};
