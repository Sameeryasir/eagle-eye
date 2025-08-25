# Image Upload API Documentation

## Overview
This API provides image upload functionality to Digital Ocean Spaces using the AWS S3 SDK.

## Setup

### 1. Install Dependencies
```bash
npm install @aws-sdk/client-s3
```

### 2. Environment Variables
Add the following environment variables to your `.env` file:

```env
# Digital Ocean Spaces Configuration
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your_spaces_access_key
DO_SPACES_SECRET=your_spaces_secret_key
DO_SPACES_BUCKET=your_bucket_name
```

**Important**: All four environment variables are required for the API to work properly.

### 3. Digital Ocean Spaces Setup
1. Create a Digital Ocean Spaces bucket
2. Generate API keys in Digital Ocean dashboard
3. Configure bucket permissions for public read access

## API Endpoints

### 1. Upload Image
**POST** `/image/upload`

Upload an image to Digital Ocean Spaces.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `image`: File (required) - The image file to upload
  - `logId`: Number (optional) - Log ID to associate the image with a specific log

**Example using curl:**
```bash
curl -X POST http://localhost:3000/image/upload \
  -F "image=@/path/to/your/image.jpg" \
  -F "logId=123"
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": 1,
    "imageUrl": "https://nyc3.digitaloceanspaces.com/bucket-name/1234567890-image.jpg",
    "filename": "1234567890-image.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg"
  }
}
```

### 2. Get All Images
**GET** `/image`

Retrieve all uploaded images.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "imageUrl": "https://nyc3.digitaloceanspaces.com/bucket-name/image1.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Image by ID
**GET** `/image/:id`

Retrieve a specific image by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "imageUrl": "https://nyc3.digitaloceanspaces.com/bucket-name/image1.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Features

- **File Validation**: Only allows image files (JPEG, PNG, GIF, WebP)
- **File Size Limit**: 10MB maximum file size
- **Unique Filenames**: Automatically generates unique filenames with timestamps using original filename
- **Log Association**: Optional association with specific log entries
- **Public Access**: Uploaded images are publicly accessible
- **Database Storage**: Image URLs are stored in the database for tracking

## Error Handling

The API returns appropriate error messages for:
- Missing files
- Invalid file types
- File size exceeded
- Missing environment variables
- Upload failures
- Database errors

## Security Notes

- Images are uploaded with public read access
- File types are validated on both client and server side
- File size limits prevent abuse
- Environment variables should be kept secure
