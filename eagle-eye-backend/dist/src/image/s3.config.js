"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3_CONFIG = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
require("dotenv/config");
exports.s3Client = new client_s3_1.S3Client({
    endpoint: process.env.SPACES_ENDPOINT,
    forcePathStyle: false,
    region: process.env.SPACES_REGION,
    credentials: {
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET,
    },
});
exports.S3_CONFIG = {
    BUCKET_NAME: process.env.SPACES_BUCKET,
    REGION: process.env.SPACES_REGION,
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    FOLDER: 'uploads/'
};
//# sourceMappingURL=s3.config.js.map