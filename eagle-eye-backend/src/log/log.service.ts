import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logs } from 'src/entities/logs.entity';
import { Tasks } from 'src/entities/tasks.entity';
import { Users } from 'src/entities/users.entity';
import { Roles } from 'src/entities/roles.entity';
import { Projects } from 'src/entities/projects.entity';
import { Repository, In, Between } from 'typeorm';
import { CreateLogDto } from './logDto/create-log.dto';
import { UpdateLogDto } from './logDto/update-log.dto';

interface AuthenticatedUser {
  id: number;
  email: string;
  role: Roles;
}

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Logs) private logrepo: Repository<Logs>,
    @InjectRepository(Tasks) private taskrepo: Repository<Tasks>,
    @InjectRepository(Users) private userrepo: Repository<Users>,
  ) {}

  private checkAuth(user: AuthenticatedUser) {
    if (!user || !user.id) {
      throw new UnauthorizedException('Login required');
    }
  }

  private checkAdmin(user: AuthenticatedUser) {
    this.checkAuth(user);
    if (!user.role || !['Employee', 'Manager', 'Owner'].includes(user.role.name)) {
      throw new UnauthorizedException(
        'you are unauthorized to perform this action',
      );
    }
  }

  async createLog(createLogDto: CreateLogDto, authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);

    // --- Validation Step ---
    // Check if authenticated user exists in database and has correct role
    const user = await this.userrepo.findOne({
      where: { id: authUser.id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.role || !['Employee', 'Manager'].includes(user.role.name)) {
      throw new UnauthorizedException('User does not have required role');
    }

    // --- Task Validation Step ---
    // Handle multiple task IDs (supports both single task_id and array of task_ids)
    const taskIds = Array.isArray(createLogDto.task_id)
      ? createLogDto.task_id
      : [createLogDto.task_id];
    const projectId = createLogDto.project_id;

    // Check if all tasks exist in database and load their project relations
    const tasks = await this.taskrepo.find({
      where: { id: In(taskIds) },
      relations: ['project'],
    });

    if (tasks.length !== taskIds.length) {
      const foundTaskIds = tasks.map((task) => task.id);
      const missingTaskIds = taskIds.filter((id) => !foundTaskIds.includes(id));
      throw new NotFoundException(
        `Tasks not found: ${missingTaskIds.join(', ')}`,
      );
    }

    // --- Project Validation Step ---
    // Ensure all tasks belong to the provided project ID
    const tasksNotInProject = tasks.filter(
      (task) => task.project?.id !== projectId,
    );
    if (tasksNotInProject.length > 0) {
      const invalidTaskIds = tasksNotInProject.map((task) => task.id);
      throw new BadRequestException(
        `Tasks ${invalidTaskIds.join(', ')} do not belong to project ${projectId}`,
      );
    }

    // Ensure all tasks have a project assigned
    const tasksWithoutProject = tasks.filter((task) => !task.project?.id);
    if (tasksWithoutProject.length > 0) {
      const unassignedTaskIds = tasksWithoutProject.map((task) => task.id);
      throw new BadRequestException(
        `Tasks ${unassignedTaskIds.join(', ')} are not assigned to any project`,
      );
    }

    // --- Duplicate Log Check Step ---
    // Check if logs already exist for any of the tasks
    const existingLogs = await this.logrepo.find({
      where: {
        user: { id: user.id },
        tasks: { id: In(taskIds) },
      },
      relations: ['tasks'],
    });

    if (existingLogs.length > 0) {
      // Find which tasks already have logs
      const tasksWithLogs = existingLogs.flatMap((log) =>
        log.tasks.map((task) => task.id),
      );
      const duplicateTaskIds = taskIds.filter((id) =>
        tasksWithLogs.includes(id),
      );
      throw new BadRequestException(
        `You can create One log against one project. Tasks ${duplicateTaskIds.join(', ')} already have logs.`,
      );
    }

    // --- Log Creation Step ---
    // Create a single log entry that will be associated with multiple tasks
    // This implements the one-to-many relationship: one Log -> many Tasks
    const log = this.logrepo.create({
      note: createLogDto.note,
      user: user,
      tasks: tasks, // Assign all tasks to this single log entry
    });

    const savedLog = await this.logrepo.save(log);

    return {
      message: `Successfully created log with ${tasks.length} task(s)`,
      log: savedLog,
    };
  }

  async getLogs(authUser: AuthenticatedUser, projectId: number) {
    // --- Authentication Step ---
    this.checkAuth(authUser);

    // --- Authorization Step ---
    const roleName = authUser.role?.name;
    if (!roleName || !['Employee', 'Manager', 'Owner'].includes(roleName)) {
      throw new UnauthorizedException('Only Employee, Manager, and Owner roles can access this feature');
    }

    // --- Validation Step ---
    // Input validation to avoid invalid integer usage downstream
    if (
      projectId === null ||
      projectId === undefined ||
      Number.isNaN(Number(projectId))
    ) {
      throw new BadRequestException('Invalid project id');
    }

    // Check if authenticated user exists in database and has correct role
    const user = await this.userrepo.findOne({
      where: { id: authUser.id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (
      !user.role ||
      !['Employee', 'Manager', 'Owner'].includes(user.role.name)
    ) {
      throw new UnauthorizedException('User does not have required role');
    }

    // --- Data Fetch (Business Rule) ---
    // Owner: Get all logs from the project; Employee/Manager: Get only their own logs
    const isOwner = user.role.name === 'Owner';
    
    const logs = await this.logrepo.find({
      where: isOwner
        ? {
            tasks: {
              project: { id: projectId },
            },
          }
        : {
            user: { id: user.id },
            tasks: {
              project: { id: projectId },
            },
          },
      relations: ['user', 'images', 'tasks', 'tasks.project'],
      order: { createdAt: 'DESC' },
      take: 10, // Get only the 10 most recent logs
    });

    return logs;
  }

  async updateLog(
    logId: number,
    updateLogDto: UpdateLogDto,
    authUser: AuthenticatedUser,
  ) {
    // --- Role Validation: Employee, Manager, and Owner can update logs ---
    // Check if authenticated user exists in database and has correct role
    const user = await this.userrepo.findOne({
      where: { id: authUser.id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (
      !user.role ||
      !['Employee', 'Manager', 'Owner'].includes(user.role.name)
    ) {
      throw new UnauthorizedException('User does not have required role');
    }

    // Check if log exists
    const log = await this.logrepo.findOne({
      where: { id: logId },
      relations: ['user', 'tasks'],
    });
    if (!log) {
      throw new NotFoundException('Log not found');
    }

    // Update the existing log with new data from DTO
    if (updateLogDto.note) {
      log.note = updateLogDto.note;
    } else {
      throw new BadRequestException('Enter the Log to update');
    }

    return await this.logrepo.save(log);
  }

  async deleteLog(logId: number, authUser: AuthenticatedUser) {
    const user = await this.userrepo.findOne({
      where: { id: authUser.id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (
      !user.role ||
      !['Employee', 'Manager', 'Owner'].includes(user.role.name)
    ) {
      throw new UnauthorizedException('User does not have required role');
    }

    // Check if log exists
    const log = await this.logrepo.findOne({
      where: { id: logId },
      relations: ['user', 'tasks'],
    });
    if (!log) {
      throw new NotFoundException('Log not found');
    }

    // Delete the log
    await this.logrepo.remove(log);
    return log;
  }

  async getLogById(logId: number, authUser: AuthenticatedUser) {
    // --- Role Validation: Employee, Manager, and Owner can view a log ---
    const user = await this.userrepo.findOne({
      where: { id: authUser.id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (
      !user.role ||
      !['Employee', 'Manager', 'Owner'].includes(user.role.name)
    ) {
      throw new UnauthorizedException('User does not have required role');
    }

    // --- Fetch log with relations ---
    const log = await this.logrepo.findOne({
      where: { id: logId },
      relations: [
        'user',
        'tasks',
        'tasks.project',
        'tasks.assignedTo',
        'images',
      ],
    });
    if (!log) {
      throw new NotFoundException('Log not found');
    }

    return log;
  }

  // --- Owner Enhancement: Get 10 Recent Logs for Specific Project ---
  // Owner gets access to 10 most recent logs from tasks of a specific project
  async getRecentLogsForOwner(authUser: AuthenticatedUser, projectId: number) {
    // --- Authentication Step ---
    this.checkAuth(authUser);

    // --- Authorization Step ---
    const roleName = authUser.role?.name;
    if (!roleName || roleName !== 'Owner') {
      throw new UnauthorizedException(
        'Only Owner role can access this feature',
      );
    }

    // --- Validation Step ---
    // Input validation to avoid invalid integer usage downstream
    if (
      projectId === null ||
      projectId === undefined ||
      Number.isNaN(Number(projectId))
    ) {
      throw new BadRequestException('Invalid project id');
    }

    // --- Data Fetch (Business Rule) ---
    // Owner gets 10 most recent logs from tasks of the specific project
    const recentLogs = await this.logrepo.find({
      where: {
        tasks: {
          project: { id: projectId },
        },
      },
      relations: ['user', 'images'],
      order: { createdAt: 'DESC' },
      take: 10, // Get 10 most recent logs
    });

    return recentLogs;
  }
}
