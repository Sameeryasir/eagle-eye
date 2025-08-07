import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tasks } from 'src/entities/tasks.entity';
import { Admin, Auth, Repository } from 'typeorm';
import { CreateTaskDto } from './taskDto/create-task.dto';
import { Roles } from 'src/entities/roles.entity';
import { Users } from 'src/entities/users.entity';
import { Projects } from 'src/entities/projects.entity';
import { UpdateTaskDto } from './taskDto/update-task.dto';
import { retry } from 'rxjs';
import { MoreThanOrEqual,LessThanOrEqual } from 'typeorm';
interface AuthenticatedUser {
  id: number;
  email: string;
  role: Roles;
}
@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Tasks) private taskRepo: Repository<Tasks>,
    @InjectRepository(Users) private userRepo: Repository<Users>,
    @InjectRepository(Projects) private projectRepo: Repository<Projects>,
  ) {}
  private checkAuth(user: AuthenticatedUser) {
    if (!user || !user.id) {
      throw new UnauthorizedException('Login required');
    }
  }

  private checkAdmin(user: AuthenticatedUser) {
    this.checkAuth(user);
    if (!user.role || !['Admin', 'Owner', 'Manager'].includes(user.role.name)) {
      throw new UnauthorizedException(
        'you are unauthorized to perform this action',
      );
    }
  }


async getTaskByProjectId(projectId: number, authUser: AuthenticatedUser) {
  this.checkAdmin(authUser);

  // 1) Ensure project exists
  const project = await this.projectRepo.findOne({ where: { id: projectId } });
  if (!project) throw new NotFoundException('Project not found');

  const now = new Date();

  // 2) Fetch only upcoming or ongoing tasks
  const tasks = await this.taskRepo.find({
    where: [
      // Tasks starting in the future
      {
        project: { id: projectId },
        startTime: MoreThanOrEqual(now),
      },
      // Tasks already started but not ended
      {
        project: { id: projectId },
        startTime: LessThanOrEqual(now),
        endTime: MoreThanOrEqual(now),
      },
    ],
    relations: ['project', 'assignedTo'],
    order: { startTime: 'DESC' },
  });

  return tasks;
}


  async getTask(authUser: AuthenticatedUser) {
    // Check if the user is an Employee
    if (authUser.role.name !== 'Employee') {
      throw new ForbiddenException('Only Employees can access their tasks');
    }

    // Fetch tasks assigned to the current authenticated user
    const tasks = await this.taskRepo.find({
      where: {
        assignedTo: {
          id: authUser.id,
        },
      },
      relations: ['project', 'assignedTo'],
    });

    return tasks;
  }

  async createTask(CreateTaskDto: CreateTaskDto, authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);

    const {
      title,
      description,
      startTime,
      endTime,
      projectId,
      assignedToUserId,
    } = CreateTaskDto;

    // ✅ Explicitly check for required IDs
 

    if (!projectId) {
      throw new BadRequestException('project is required');
    }

    let user: Users | null = null;
    
    // Only validate user if assignedToUserId is provided
    if (assignedToUserId) {
      user = await this.userRepo.findOne({
        where: { id: assignedToUserId },
        relations: ['company', 'role'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role?.name !== 'Employee') {
        throw new BadRequestException('Task can only be assigned to an Employee');
      }

      if (!user.company?.id) {
        throw new BadRequestException(
          'Assigned employee must be associated with a company',
        );
      }
    }

    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['company', 'company.owner'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.company?.id) {
      throw new BadRequestException(
        'Project must be associated with a company',
      );
    }

    if (authUser.role.name === 'Owner') {
      if (!project.company.owner?.id) {
        throw new ForbiddenException('Project company has no owner');
      }

      if (project.company.owner.id !== authUser.id) {
        throw new ForbiddenException(
          `Access denied: You can only create tasks for projects in your own company.`,
        );
      }

      if (user && user.company.id !== project.company.id) {
        throw new ForbiddenException(
          `Access denied: You can only assign tasks to employees in your own company.`,
        );
      }
    } else if (authUser.role.name === 'Manager') {
      const authUserWithCompany = await this.userRepo.findOne({
        where: { id: authUser.id },
        relations: ['company'],
      });

      if (!authUserWithCompany?.company?.id) {
        throw new ForbiddenException(
          'You must be associated with a company to create tasks',
        );
      }

      if (authUserWithCompany.company.id !== project.company.id) {
        throw new ForbiddenException(
          `Access denied: You can only create tasks for projects in your own company.`,
        );
      }

      if (user && user.company.id !== authUserWithCompany.company.id) {
        throw new ForbiddenException(
          `Access denied: You can only assign tasks to employees in your own company.`,
        );
      }
    }

    const newTask = this.taskRepo.create({
      title,
      description,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      assignedTo: user || undefined,
      project,
    });

    return await this.taskRepo.save(newTask);
  }

  async updateTaskById(
    updateTaskDto: UpdateTaskDto,
    authUser: AuthenticatedUser,
    id: number,
  ) {
    this.checkAdmin(authUser);

    const task = await this.taskRepo.findOne({
      where: { id },
      relations: [
        'project',
        'project.company',
        'project.company.owner',
        'assignedTo',
      ],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const roleName = authUser.role?.name;

    // Authorization logic
    if (roleName === 'Owner') {
      // Owner can only update tasks from their own company
      if (!task.project?.company?.owner?.id) {
        throw new ForbiddenException('Task is not associated with any company');
      }

      if (task.project.company.owner.id !== authUser.id) {
        throw new ForbiddenException(
          `Access denied: You can only update tasks from your own company`,
        );
      }
    } else if (roleName === 'Manager') {
      // Manager can only update tasks in their company
      const authUserWithCompany = await this.userRepo.findOne({
        where: { id: authUser.id },
        relations: ['company'],
      });

      if (!authUserWithCompany?.company?.id) {
        throw new ForbiddenException(
          'You must be associated with a company to update tasks',
        );
      }

      if (!task.project?.company?.id) {
        throw new ForbiddenException('Task is not associated with any company');
      }

      if (task.project.company.id !== authUserWithCompany.company.id) {
        throw new ForbiddenException(
          `Access denied: You can only update tasks in your own company.`,
        );
      }
    } else if (roleName !== 'Admin') {
      throw new ForbiddenException(
        'Only Admins, Owners, and Managers can update tasks',
      );
    }

    // Update common fields
    if (updateTaskDto.title) {
      task.title = updateTaskDto.title;
    }
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }
    if (updateTaskDto.startTime) {
      task.startTime = new Date(updateTaskDto.startTime);
    }
    if (updateTaskDto.endTime) {
      task.endTime = new Date(updateTaskDto.endTime);
    }

    // Update project if provided
    if (updateTaskDto.projectId) {
      const newProject = await this.projectRepo.findOne({
        where: { id: updateTaskDto.projectId },
        relations: ['company', 'company.owner'],
      });

      if (!newProject) {
        throw new BadRequestException('Invalid project ID');
      }

      // Authorization for project update
      if (roleName === 'Owner') {
        // Owner can only assign to projects in their own company
        if (!newProject.company?.owner?.id) {
          throw new ForbiddenException(
            'Project is not associated with any company',
          );
        }

        if (newProject.company.owner.id !== authUser.id) {
          throw new ForbiddenException(
            `Access denied: You can only update tasks to projects in your own company.`,
          );
        }
      } else if (roleName === 'Manager') {
        // Manager can only assign to projects in their company
        const authUserWithCompany = await this.userRepo.findOne({
          where: { id: authUser.id },
          relations: ['company'],
        });

        if (!authUserWithCompany?.company?.id) {
          throw new ForbiddenException(
            'You must be associated with a company to assign tasks to projects',
          );
        }

        if (!newProject.company?.id) {
          throw new ForbiddenException(
            'Project is not associated with any company',
          );
        }

        if (newProject.company.id !== authUserWithCompany.company.id) {
          throw new ForbiddenException(
            `Access denied: You can only assign tasks to projects in your own company. Your company ID: ${authUserWithCompany.company.id}, Project company ID: ${newProject.company.id}`,
          );
        }
      }
      // Admin can assign to any project (no additional check needed)

      task.project = newProject;
    }

    // All roles can update assigned user if valid and in their company (Owner/Manager restriction)
    if (updateTaskDto.assignedToUserId) {
      const newAssignedUser = await this.userRepo.findOne({
        where: { id: updateTaskDto.assignedToUserId },
        relations: ['role', 'company', 'company.owner'],
      });

      if (!newAssignedUser) {
        throw new BadRequestException('Invalid assigned user ID');
      }

      if (newAssignedUser.role?.name !== 'Employee') {
        throw new BadRequestException(
          'Task can only be assigned to an Employee',
        );
      }

      if (roleName === 'Owner') {
        // Owner can only assign to employees in their own company
        if (!newAssignedUser.company?.id) {
          throw new ForbiddenException(
            'Assigned user is not associated with any company',
          );
        }

        if (!newAssignedUser.company?.owner?.id) {
          throw new ForbiddenException("Assigned user's company has no owner");
        }

        if (newAssignedUser.company.owner.id !== authUser.id) {
          throw new ForbiddenException(
            `Access denied: You can only assign tasks to employees in your own company. Employee belongs to company ID: ${newAssignedUser.company.id}`,
          );
        }
      } else if (roleName === 'Manager') {
        // Manager can only assign to employees in their company
        const authUserWithCompany = await this.userRepo.findOne({
          where: { id: authUser.id },
          relations: ['company'],
        });

        if (!authUserWithCompany?.company?.id) {
          throw new ForbiddenException(
            'You must be associated with a company to assign tasks',
          );
        }

        if (!newAssignedUser.company?.id) {
          throw new ForbiddenException(
            'Assigned user is not associated with any company',
          );
        }

        if (newAssignedUser.company.id !== authUserWithCompany.company.id) {
          throw new ForbiddenException(
            `Access denied: You can only assign tasks to employees in your own company. Your company ID: ${authUserWithCompany.company.id}, Employee company ID: ${newAssignedUser.company.id}`,
          );
        }
      }

      task.assignedTo = newAssignedUser;
    }

    return await this.taskRepo.save(task);
  }
  async deleteTask(id: number, authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);
    const task = await this.taskRepo.findOne({
      where: {
        id: id,
      },
      relations: ['project', 'project.company', 'assignedTo'],
    });
    if (!task) {
      throw new NotFoundException('No task found');
    }
    await this.taskRepo.remove(task);
    return task;
  }
}
