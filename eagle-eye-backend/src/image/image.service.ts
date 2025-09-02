import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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
      
      // Calculate file size in MB
      const fileSizeInMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));
      
      const image = this.imagesRepository.create({
        imageUrl,
        fileName: file.originalname, // Original file name
        size: fileSizeInMB, // File size in MB
        log: logId ? { id: logId } : undefined,
      });

      const savedImage = await this.imagesRepository.save(image);

      return {
        id: savedImage.id,
        imageUrl: savedImage.imageUrl,
        fileName: savedImage.fileName,
        size: savedImage.size,
        logId: logId || null,
        createdAt: savedImage.createdAt,
      };

    } catch (error) {
      console.error('Image upload failed:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[], logId?: number) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed per upload');
    }

    // Upload all files in parallel instead of sequentially
    const uploadPromises = files.map(async (file) => {
      try {
        const uploadedImage = await this.uploadImage(file, logId);
        return uploadedImage;
      } catch (error) {
        console.error(`Failed to upload file ${file.originalname}:`, error);
        return {
          fileName: file.originalname,
          error: 'Failed to upload this file',
        };
      }
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return {
      message: `Uploaded ${uploadedImages.filter((img: any) => !img.error).length} out of ${files.length} images`,
      images: uploadedImages,
    };
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    
    return `${timestamp}-${randomString}.${extension}`;
  }

  async getImageById(imageId: number) {
    const image = await this.imagesRepository.findOne({ 
      where: { id: imageId },
      relations: ['log']
    });
    
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return {
      id: image.id,
      imageUrl: image.imageUrl,
      fileName: image.fileName,
      size: image.size,
      logId: image.log?.id || null,
      createdAt: image.createdAt,
    };
  }

  async deleteImage(imageId: number) {
    // Find the image in database
    const image = await this.imagesRepository.findOne({ where: { id: imageId } });
    
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    try {
      // Extract the key from the imageUrl
      const imageUrl = image.imageUrl;
      const key = imageUrl.replace(`https://${S3_CONFIG.BUCKET_NAME}.${S3_CONFIG.REGION}.digitaloceanspaces.com/${S3_CONFIG.FOLDER}`, '');

      // Delete from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: `${S3_CONFIG.FOLDER}${key}`,
      });

      await s3Client.send(deleteCommand);

      // Delete from database
      await this.imagesRepository.remove(image);

      return {
        message: 'Image deleted successfully',
        deletedImage: {
          id: image.id,
          fileName: image.fileName,
          imageUrl: image.imageUrl,
        }
      };

    } catch (error) {
      console.error('Image deletion failed:', error);
      throw new BadRequestException('Failed to delete image');
    }
  }

  async updateImage(imageId: number, updateData: { fileName?: string; logId?: number }, newFile?: Express.Multer.File) {
    // Find the image in database
    const image = await this.imagesRepository.findOne({ 
      where: { id: imageId },
      relations: ['log']
    });
    
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    try {
      // If a new file is provided, upload it to S3 and update the image
      if (newFile) {
        // Validate the new file
        if (newFile.size > S3_CONFIG.MAX_FILE_SIZE) {
          throw new BadRequestException('File size exceeds maximum limit');
        }

        if (!S3_CONFIG.ALLOWED_TYPES.includes(newFile.mimetype)) {
          throw new BadRequestException('Invalid file type');
        }

        // Extract the key from the existing imageUrl
        const existingImageUrl = image.imageUrl;
        const existingKey = existingImageUrl.replace(`https://${S3_CONFIG.BUCKET_NAME}.${S3_CONFIG.REGION}.digitaloceanspaces.com/${S3_CONFIG.FOLDER}`, '');

        // Delete the old file from S3
        const deleteCommand = new DeleteObjectCommand({
          Bucket: S3_CONFIG.BUCKET_NAME,
          Key: `${S3_CONFIG.FOLDER}${existingKey}`,
        });
        await s3Client.send(deleteCommand);

        // Upload the new file to S3
        const newFileName = this.generateFileName(newFile.originalname);
        const newKey = `${S3_CONFIG.FOLDER}${newFileName}`;

        const uploadCommand = new PutObjectCommand({
          Bucket: S3_CONFIG.BUCKET_NAME,
          Key: newKey,
          Body: newFile.buffer,
          ContentType: newFile.mimetype,
          ACL: 'public-read',
        });

        await s3Client.send(uploadCommand);

        // Update image properties
        image.imageUrl = `https://${S3_CONFIG.BUCKET_NAME}.${S3_CONFIG.REGION}.digitaloceanspaces.com/${newKey}`;
        image.fileName = newFile.originalname;
        image.size = parseFloat((newFile.size / (1024 * 1024)).toFixed(2));
      }

      // Update fileName if provided (only if no new file is uploaded)
      if (updateData.fileName !== undefined && !newFile) {
        image.fileName = updateData.fileName;
      }

      // Update logId if provided
      if (updateData.logId !== undefined) {
        // If logId is provided, update the log relationship
        if (updateData.logId) {
          image.log = { id: updateData.logId } as any;
        } else {
          // If logId is null, remove the log relationship
          image.log = null as any;
        }
      }

      // Save the updated image
      const updatedImage = await this.imagesRepository.save(image);

      return {
        message: 'Image updated successfully',
        image: {
          imageUrl: updatedImage.imageUrl,
          fileName: updatedImage.fileName,
          size: updatedImage.size,
          logId: updatedImage.log?.id || null,
          createdAt: updatedImage.createdAt,
        }
      };

    } catch (error) {
      console.error('Image update failed:', error);
      throw new BadRequestException('Failed to update image');
    }
  }
}
