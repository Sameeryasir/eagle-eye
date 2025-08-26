import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { Images } from '../entities/images.entity';
import { Logs } from '../entities/logs.entity';

/**
 * Image Module
 * 
 * Provides image upload, retrieval, and management functionality
 * 
 * Dependencies:
 * - TypeORM for database operations
 * - Images entity for data persistence
 * - Multer for file upload handling (configured in controller)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Images, Logs]), // Register Images and Logs entities for repository injection
    ConfigModule, // Import ConfigModule for environment variables
  ],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService], // Export service for use in other modules if needed
})
export class ImageModule {}
