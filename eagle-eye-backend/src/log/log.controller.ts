import { Body, Controller, Post, UseGuards, ValidationPipe, Request, Get, Put, Param, ParseIntPipe, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { LogService } from './log.service';
import { CreateLogDto } from './logDto/create-log.dto';
import { UpdateLogDto } from './logDto/update-log.dto';
import { AuthGuard } from '@nestjs/passport';



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

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getLogById(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const log = await this.logService.getLogById(Number(id), user);
    return log;
  }



  @Put(':id')
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

  @Delete(':id')
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
