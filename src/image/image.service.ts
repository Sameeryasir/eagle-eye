import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Images } from '../entities/images.entity';
import { s3Client, S3_CONFIG } from './s3.config';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Images)
    private readonly imagesRepository: Repository<Images>,
  ) {}

  async uploadImage(file: Express.Multer.File, logId?: number) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > S3_CONFIG.MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds maximum limit');
    }

    if (!S3_CONFIG.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    try {
      const fileName = this.generateFileName(file.originalname);
      const key = `${S3_CONFIG.FOLDER}${fileName}`;

      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await s3Client.send(uploadCommand);

      const imageUrl = `https://${S3_CONFIG.BUCKET_NAME}.${S3_CONFIG.REGION}.digitaloceanspaces.com/${key}`;
      
      // Save only imageUrl and logId to database
      const image = this.imagesRepository.create({
        imageUrl,
        log: logId ? { id: logId } : undefined,
      });

      const savedImage = await this.imagesRepository.save(image);

      // Return enhanced response with metadata from file upload
      return {
        id: savedImage.id,
        imageUrl: savedImage.imageUrl,
        logId: logId || null,
        createdAt: savedImage.createdAt,
      };

    } catch (error) {
      console.error('Image upload failed:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    
    return `${timestamp}-${randomString}.${extension}`;
  }
}
