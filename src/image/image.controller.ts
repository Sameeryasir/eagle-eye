import { 
  Controller, 
  Post, 
  Get,
  Put,
  Delete,
  UseInterceptors, 
  UploadedFile,
  UploadedFiles,
  Body,
  Param,
  ParseIntPipe,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { UploadImageDto } from './imageDto/upload-image.dto';
import { UpdateImageDto } from './imageDto/update-image.dto';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: undefined, // Use memory storage for buffer access
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
      },
      fileFilter: (req, file, callback) => {
        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type. Only images are allowed.'), false);
        }
      },
    })
  )
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadData: UploadImageDto
  ) {
    // Extract logId from body if provided
    const logId = uploadData.logId ? Number(uploadData.logId) : undefined;
    
    return await this.imageService.uploadMultipleImages(files, logId);
  }

  @Get(':id')
  async getImage(@Param('id', ParseIntPipe) id: number) {
    return this.imageService.getImageById(id);
  }

  @Delete(':id')
  async deleteImage(@Param('id', ParseIntPipe) id: number) {
    return this.imageService.deleteImage(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: undefined, // Use memory storage for buffer access
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, callback) => {
        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type. Only images are allowed.'), false);
        }
      },
    })
  )
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateData: UpdateImageDto
  ) {
    return this.imageService.updateImage(id, updateData, file);
  }
}
