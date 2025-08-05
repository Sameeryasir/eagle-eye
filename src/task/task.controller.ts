import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './taskDto/create-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateTaskDto } from './taskDto/update-task.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getTaskByProjectId(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const tasks = await this.taskService.getTaskByProjectId(Number(id), user);
    return tasks;
  }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getTask(@Request() req) {
    const user = req.user;
    const tasks = await this.taskService.getTask(user);
    return tasks;
  }
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createTask(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
    @Request() req,
  ) {
    const user = req.user;
    const task = await this.taskService.createTask(createTaskDto, user);
    return task;
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateTask(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    const user = req.user;
    const task = await this.taskService.updateTaskById(
      updateTaskDto,
      user,
      Number(id),
    );
    return task;
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteTask(@Param('id')id:string ,@Request() req){
    const user = req.user
    const task = await this.taskService.deleteTask(Number(id),user)
    return task;
  }
}
