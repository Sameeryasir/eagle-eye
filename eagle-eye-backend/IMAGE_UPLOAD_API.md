# Image Upload API Documentation

## Overview

The Image Upload API provides functionality to upload, retrieve, and manage images using DigitalOcean Spaces (S3-compatible storage). Images are stored securely in the cloud and metadata is maintained in the PostgreSQL database.

## Features

- ✅ **Secure File Upload**: Images uploaded to DigitalOcean Spaces with public access
- ✅ **File Validation**: Size and type validation (JPEG, PNG, GIF, WebP)
- ✅ **Unique Naming**: UUID-based filenames to prevent conflicts
- ✅ **Database Integration**: Image metadata stored in PostgreSQL
- ✅ **CRUD Operations**: Upload, retrieve, list, and delete images
- ✅ **Pagination**: Support for paginated image listing
- ✅ **Error Handling**: Comprehensive error handling and validation

## Environment Variables Required

Add these environment variables to your `.env` file:

```env
# DigitalOcean Spaces Configuration
SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
SPACES_KEY=your_access_key_here
SPACES_SECRET=your_secret_key_here
SPACES_BUCKET=your_bucket_name
SPACES_REGION=sgp1
```

## API Endpoints

### 1. Upload Image

**POST** `/image/upload`

Upload a single image file to DigitalOcean Spaces.

#### Request

- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file` (required): Image file (JPEG, PNG, GIF, WebP)
  - `logId` (optional): Associate image with a log entry
  - `description` (optional): Image description

#### File Requirements

- **Maximum Size**: 10MB
- **Allowed Types**: JPEG, JPG, PNG, GIF, WebP
- **Storage**: DigitalOcean Spaces with public access

#### Response

```json
{
  "id": 1,
  "imageUrl": "https://your-bucket.sgp1.digitaloceanspaces.com/uploads/uuid-filename.jpg",
  "filename": "uuid-filename.jpg",
  "originalName": "original-image.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg",
  "logId": 123,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### Example Usage

```bash
# Using curl
curl -X POST http://localhost:3000/image/upload \
  -F "file=@/path/to/image.jpg" \
  -F "logId=123" \
  -F "description=Project screenshot"

# Using JavaScript/Fetch
const formData = new FormData();
formData.append('file', imageFile);
formData.append('logId', '123');
formData.append('description', 'Project screenshot');

const response = await fetch('/image/upload', {
  method: 'POST',
  body: formData
});
```

### 2. Get Image by ID

**GET** `/image/:id`

Retrieve image metadata by ID.

#### Response

```json
{
  "id": 1,
  "imageUrl": "https://your-bucket.sgp1.digitaloceanspaces.com/uploads/uuid-filename.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 3. Get All Images

**GET** `/image?page=1&limit=10`

Retrieve paginated list of all images.

#### Query Parameters

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)

#### Response

```json
{
  "images": [
    {
      "id": 1,
      "imageUrl": "https://your-bucket.sgp1.digitaloceanspaces.com/uploads/uuid-filename.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 25
}
```

### 4. Delete Image

**DELETE** `/image/:id`

Delete image from both DigitalOcean Spaces and database.

#### Response

```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## Error Responses

### Validation Errors

```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum limit of 10MB",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "Invalid file type. Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/webp",
  "error": "Bad Request"
}
```

### Not Found Error

```json
{
  "statusCode": 400,
  "message": "Image not found",
  "error": "Bad Request"
}
```

### Server Error

```json
{
  "statusCode": 500,
  "message": "Failed to upload image. Please try again.",
  "error": "Internal Server Error"
}
```

## Setup Instructions

### 1. DigitalOcean Spaces Setup

1. Create a DigitalOcean account
2. Create a new Space (bucket)
3. Generate API keys with read/write permissions
4. Configure CORS if needed for web applications

### 2. Environment Configuration

Ensure all required environment variables are set in your `.env` file.

### 3. Database Migration

The Images table should already be created via migrations. If not, run:

```bash
npm run migration:run
```

### 4. Testing the API

```bash
# Start the development server
npm run start:dev

# Test upload endpoint
curl -X POST http://localhost:3000/image/upload \
  -F "file=@test-image.jpg"
```

## Security Considerations

1. **File Validation**: All uploaded files are validated for type and size
2. **Unique Naming**: UUID-based filenames prevent path traversal attacks
3. **Public Access**: Images are stored with public-read ACL for easy access
4. **Environment Variables**: Sensitive credentials stored in environment variables
5. **Error Handling**: Detailed error messages help with debugging

## Performance Optimizations

1. **Caching**: Images are served with 1-year cache headers
2. **CDN**: DigitalOcean Spaces provides global CDN access
3. **Pagination**: Large image lists are paginated for better performance
4. **Memory Storage**: Multer uses memory storage for efficient processing

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check DigitalOcean Spaces credentials and bucket permissions
2. **File Too Large**: Ensure file is under 10MB limit
3. **Invalid File Type**: Only image files (JPEG, PNG, GIF, WebP) are allowed
4. **Database Errors**: Verify database connection and Images table exists

### Debug Mode

Enable debug logging by checking console output for detailed error messages.

## Integration Examples

### Frontend Integration (React)

```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('/api/image/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await response.json();
    return result.imageUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

### Mobile App Integration

```javascript
// React Native example
const uploadImage = async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg'
  });
  
  const response = await fetch('/api/image/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  
  return response.json();
};
```

## Support

For issues or questions regarding the Image Upload API, please check:

1. Environment variable configuration
2. DigitalOcean Spaces setup
3. Database connectivity
4. File upload requirements

The API follows RESTful principles and provides comprehensive error handling for easy integration and debugging.
