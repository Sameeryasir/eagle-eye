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
  BadRequestException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './taskDto/create-task.dto';
import { TaskFilterDto } from './taskDto/task-filter.dto';
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
    const projectId = Number(id);
    if (Number.isNaN(projectId)) {
      throw new BadRequestException('Invalid project id');
    }
    const tasks = await this.taskService.getTaskByProjectId(projectId, user);
    return tasks;
  }
  
  // Sort tasks by createdAt or startTime (limited fields)
  @Post('filter')
  @UseGuards(AuthGuard('jwt'))
  async filterTasks(
    @Body(ValidationPipe) body: TaskFilterDto,
    @Request() req,
  ) {
    const user = req.user;
    const tasks = await this.taskService.filterTasks(body, user);
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

  // --- Assign Task to User ---
  // Change Summary (MCP Context 7):
  // - What: Added route to assign a task to a user using task id from params and assignedToUserId from body.
  // - Why: To expose service `assignTaskToUser` via controller as requested.
  // - Dependencies: Uses TaskService.assignTaskToUser.
  @Post('assign/:id')
  @UseGuards(AuthGuard('jwt'))
  async assignTaskToUser(
    @Param('id') id: string,
    @Body(ValidationPipe) body: { assignedToUserId?: number },
    @Request() req,
  ) {
    // --- Validation Step ---
    if (!body || typeof body.assignedToUserId !== 'number') {
      throw new BadRequestException('assignedToUserId (number) is required');
    }

    // --- Business Rule ---
    // Only Admin/Owner/Manager can assign; assignee must be Employee or Manager (enforced in service)
    const user = req.user;
    const task = await this.taskService.assignTaskToUser(
      Number(id),
      body.assignedToUserId,
      user,
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
