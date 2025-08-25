import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  UseInterceptors, 
  UploadedFile, 
  Body, 
  ParseIntPipe,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { UploadImageDto } from './imageDto/upload-image.dto';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Upload image to Digital Ocean Spaces
   * POST /image/upload
   * @param file - The uploaded image file
   * @param uploadDto - Upload metadata (filename, optional folder)
   * @returns Upload response with image URL and metadata
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, callback) => {
      // Validate file type
      if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('Only image files are allowed'), false);
      }
      callback(null, true);
    },
  }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadImageDto,
  ) {
    return await this.imageService.uploadImage(file, uploadDto);
  }

  /**
   * Get all uploaded images
   * GET /image
   * @returns List of all uploaded images
   */
  @Get()
  async getAllImages() {
    return await this.imageService.getAllImages();
  }

  /**
   * Get image by ID
   * GET /image/:id
   * @param id - Image ID
   * @returns Image record by ID
   */
  @Get(':id')
  async getImageById(@Param('id', ParseIntPipe) id: number) {
    return await this.imageService.getImageById(id);
  }
}
