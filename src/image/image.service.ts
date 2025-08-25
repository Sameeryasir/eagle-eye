import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Images } from '../entities/images.entity';
import { Logs } from '../entities/logs.entity';
import { UploadImageDto } from './imageDto/upload-image.dto';

@Injectable()
export class ImageService {
  private s3Client: S3Client;
  private bucketName: string;
  private endpoint: string;

  constructor(
    @InjectRepository(Images)
    private imagesRepository: Repository<Images>,
    @InjectRepository(Logs)
    private logsRepository: Repository<Logs>,
  ) {
    // Initialize S3 client for Digital Ocean Spaces
    // Note: Digital Ocean Spaces uses S3-compatible API
    const endpoint = process.env.DO_SPACES_ENDPOINT;
    const accessKeyId = process.env.DO_SPACES_KEY;
    const secretAccessKey = process.env.DO_SPACES_SECRET;
    const bucketName = process.env.DO_SPACES_BUCKET;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing Digital Ocean Spaces configuration. Please set DO_SPACES_ENDPOINT, DO_SPACES_KEY, DO_SPACES_SECRET, and DO_SPACES_BUCKET environment variables.');
    }

    this.endpoint = endpoint;
    this.bucketName = bucketName;

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: 'us-east-1', // Digital Ocean Spaces default region
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: false, // Use virtual-hosted-style URLs
    });
  }

  /**
   * Upload image to Digital Ocean Spaces
   * @param file - The uploaded file buffer
   * @param uploadDto - Upload metadata
   * @returns Promise with uploaded image URL and database record
   */
  async uploadImage(file: Express.Multer.File, uploadDto: UploadImageDto) {
    try {
      // Validate file
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Only images are allowed.');
      }

      // Generate unique filename using original filename and timestamp
      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFilename = `${timestamp}-${file.originalname}`;

      // Use unique filename as file path
      const filePath = uniqueFilename;

      // Upload to Digital Ocean Spaces
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make the file publicly accessible
      });

      await this.s3Client.send(uploadCommand);

      // Generate public URL
      const imageUrl = `${this.endpoint}/${this.bucketName}/${filePath}`;

      // Validate logId if provided
      let logRecord: Logs | undefined = undefined;
      if (uploadDto.logId) {
        const foundLog = await this.logsRepository.findOne({ where: { id: uploadDto.logId } });
        if (!foundLog) {
          throw new BadRequestException(`Log with ID ${uploadDto.logId} not found`);
        }
        logRecord = foundLog;
      }

      // Save to database with optional log association
      const imageRecord = this.imagesRepository.create({
        imageUrl: imageUrl,
        log: logRecord, // Associate with log if provided
      });

      const savedImage = await this.imagesRepository.save(imageRecord);

      return {
        success: true,
        message: 'Image uploaded successfully',
        data: {
          id: savedImage.id,
          imageUrl: savedImage.imageUrl,
          filename: uniqueFilename,
          size: file.size,
          mimetype: file.mimetype,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Get all uploaded images
   * @returns Promise with all image records
   */
  async getAllImages() {
    try {
      const images = await this.imagesRepository.find({
        order: { createdAt: 'DESC' },
      });

      return {
        success: true,
        data: images,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch images: ${error.message}`);
    }
  }

  /**
   * Get image by ID
   * @param id - Image ID
   * @returns Promise with image record
   */
  async getImageById(id: number) {
    try {
      const image = await this.imagesRepository.findOne({ where: { id } });

      if (!image) {
        throw new BadRequestException('Image not found');
      }

      return {
        success: true,
        data: image,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch image: ${error.message}`);
    }
  }
}
