import { Body, Controller, Post, UseGuards, ValidationPipe, Request, Get, Put, Param, ParseIntPipe, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogService } from './log.service';
import { CreateLogDto } from './logDto/create-log.dto';
import { UpdateLogDto } from './logDto/update-log.dto';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Multer configuration
const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = extname(file.originalname);
      const filename = `log_${timestamp}_${randomString}${fileExtension}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
};

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getLogs(@Request() req) {
    const user = req.user;
    const logs = await this.logService.getLogs(user);
    return logs;
  }

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createLog(
    @Body() createLogDto: CreateLogDto,
    @Request() req
  ) {
    const user = req.user;
    
    // Create log data
    const logData = {
      note: createLogDto.note,
      task_id: createLogDto.task_id,
      user_id: user.id
    };
    
    const newLog = await this.logService.createLog(logData, user);
    return newLog;
  }



  @Put('update/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateLog(
    @Param('id') id: string,
    @Body(ValidationPipe) updateLogDto: UpdateLogDto,
    @Request() req
  ) {
    const user = req.user;
    const updatedLog = await this.logService.updateLog(Number(id), updateLogDto, user);
    return updatedLog;
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteLog(
    @Param('id') id:string,
    @Request() req
  ) {
    const user = req.user;
    const result = await this.logService.deleteLog(Number(id), user);
    return result;
  }
}
