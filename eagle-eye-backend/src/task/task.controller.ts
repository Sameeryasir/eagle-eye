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

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getTask(@Request() req) {
    const user = req.user;
    const tasks = await this.taskService.getTask(user);
    return tasks;
  }

  // Maps to: TaskService.getEmployeesToAssingeTask
  @Get('assignTo')
  @UseGuards(AuthGuard('jwt'))
  async getEmployeesToAssingeTask(@Request() req) {
    const user = req.user;
    const employees = await this.taskService.getEmployeesToAssingeTask(user);
    return employees;
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard('jwt'))
  async getTaskById(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const task = await this.taskService.getTaskById(Number(id), user);
    return task;
  }
  @Get('todays')
  @UseGuards(AuthGuard('jwt'))
  async getTodaysTask(@Request() req) {
    const user = req.user;
    const tasks = await this.taskService.getTodaysTask(user);
    return tasks;
  }
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getTaskByProjectId(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const tasks = await this.taskService.getTaskByProjectId(Number(id), user);
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
  @Put(':id/assign')
  @UseGuards(AuthGuard('jwt'))
  async assignTask(
    @Param('id') id: string,
    @Body(ValidationPipe) body: { userId: number },
    @Request() req,
  ) {
    const user = req.user;
    const result = await this.taskService.assignTaskToUser(
      Number(id),
      Number(body.userId),
      user,
    );
    return result;
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteTask(@Param('id')id:string ,@Request() req){
    const user = req.user
    const task = await this.taskService.deleteTask(Number(id),user)
    return task;
  }
}
