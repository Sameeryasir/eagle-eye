import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { Images } from '../entities/images.entity';
import { Logs } from '../entities/logs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Images, Logs]),
    MulterModule.register({
      storage: undefined, // Use memory storage for buffer handling
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
