import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';
export declare const s3Client: S3Client;
export declare const S3_CONFIG: {
    BUCKET_NAME: string;
    REGION: string;
    MAX_FILE_SIZE: number;
    ALLOWED_TYPES: string[];
    FOLDER: string;
};
