import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  Body,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { UploadImageDto } from './imageDto/upload-image.dto';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
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
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: UploadImageDto
  ) {
    // Extract logId from body if provided
    const logId = uploadData.logId ? Number(uploadData.logId) : undefined;
    
    return await this.imageService.uploadImage(file, logId);
  }
}
