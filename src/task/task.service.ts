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
import { MoreThanOrEqual, LessThanOrEqual, Not } from 'typeorm';
import { Companies } from 'src/entities/companies.entity';
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
    @InjectRepository(Companies) private companyRepo :Repository<Companies>
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

  // --- Role Validation for Manager and Employee Access ---
  private checkManagerAndEmployee(user: AuthenticatedUser) {
    this.checkAuth(user);
    if (!user.role || !['Manager', 'Employee'].includes(user.role.name)) {
      throw new UnauthorizedException(
        'Only Manager and Employee roles can access this feature',
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
    relations: ['project', 'assignedTo', 'log', 'log.images'],
    order: { startTime: 'DESC' },
  });

  return tasks;
}


  async getTask(authUser: AuthenticatedUser) {
    const now = new Date();
    
    // Fetch only upcoming or ongoing tasks assigned to the current authenticated user
    const tasks = await this.taskRepo.find({
      where: [
        // Tasks starting in the future
        {
          assignedTo: { id: authUser.id },
          startTime: MoreThanOrEqual(now),
        },
        // Tasks already started but not ended
        {
          assignedTo: { id: authUser.id },
          startTime: LessThanOrEqual(now),
          endTime: MoreThanOrEqual(now),
        },
      ],
      relations: ['project', 'assignedTo'],
      order: { startTime: 'ASC' }, // Order by start time (earliest first)
    });

    return tasks;
  }

  async getTodaysTask(authUser: AuthenticatedUser) {
    // --- Role Validation: Only Manager and Employee can access ---
    if (authUser.role.name !== 'Manager' && authUser.role.name !== 'Employee') {
      throw new UnauthorizedException('Only Manager and Employee roles can access this feature');
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Start of tomorrow
    
    // Fetch tasks created today (current date) assigned to the authenticated user
    const tasks = await this.taskRepo.find({
      where: {
        assignedTo: { id: authUser.id },
        createdAt: MoreThanOrEqual(today),
      },
      relations: ['project', 'assignedTo', 'log', 'log.images'],
      order: { createdAt: 'DESC' }, // Order by creation time (newest first)
    });

    return tasks;
  }
  async getEmployeesToAssingeTask(authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);
    
    // Validate that authUser.id is a valid number
    if (!authUser.id || isNaN(authUser.id)) {
      throw new BadRequestException('Invalid user ID');
    }

    let company;
    
    if (authUser.role.name === 'Owner') {
      // Find the company owned by the authenticated user
      company = await this.companyRepo.findOne({
        where: {
          owner: { id: authUser.id }
        }
      });
    } else if (authUser.role.name === 'Manager') {
      // Find the company where the manager works
      const managerUser = await this.userRepo.findOne({
        where: { id: authUser.id },
        relations: ['company']
      });
      
      if (!managerUser?.company) {
        throw new NotFoundException('Manager must be associated with a company');
      }
      
      company = managerUser.company;
    } else {
      throw new ForbiddenException('Only Owners and Managers can fetch employees');
    }

    if (!company) {
      throw new NotFoundException('Company not found for this user');
    }

    // Fetch users based on role permissions
    let employees;
    
    if (authUser.role.name === 'Manager') {
      // Managers can only see Employees in the dropdown
      employees = await this.userRepo.find({
        where: {
          company: { id: company.id },
          role: { name: 'Employee' }
        },
        relations: ['role'],
        select: ['id', 'first_name', 'last_name', 'email', 'phone']
      });
    } else if (authUser.role.name === 'Owner') {
      // Owners can see both Employees and Managers in the dropdown
      employees = await this.userRepo.find({
        where: [
          {
            company: { id: company.id },
            role: { name: 'Employee' }
          },
          {
            company: { id: company.id },
            role: { name: 'Manager' }
          }
        ],
        relations: ['role'],
        select: ['id', 'first_name', 'last_name', 'email', 'phone']
      });
    }

    return employees;
  }
 async createTask(CreateTaskDto: CreateTaskDto, authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);

    const {
      title,
      description,
      startTime,
      endTime,
      priority,
      projectId,
      assignedToUserId,
    } = CreateTaskDto;

    // Validate against past dates and time logic
    const now = new Date();
    if (startTime) {
      const startDate = new Date(startTime);
      if (startDate < now) {
        throw new BadRequestException('Start time cannot be in the past');
      }
      if (endTime) {
        const endDate = new Date(endTime);
        if (endDate < startDate) {
          throw new BadRequestException('End time must be after start time');
        }
        if (endDate < now) {
          throw new BadRequestException('End time cannot be in the past');
        }
      }
    }

    // Validate required project ID
    if (!projectId) {
      throw new BadRequestException('Project is required');
    }

    // Check for existing task with same time range
    if (startTime && endTime) {
      const existingTask = await this.taskRepo.findOne({
        where: {
          project: { id: projectId },
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          title,
        },
      });

      if (existingTask) {
        throw new BadRequestException('A task with the same time range already exists');
      }
    }

    let user: Users | null = null;
    
    // Validate assigned user if provided
    if (assignedToUserId) {
      user = await this.userRepo.findOne({
        where: { id: assignedToUserId },
        relations: ['company', 'role'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!['Employee', 'Manager'].includes(user.role?.name)) {
        throw new BadRequestException('Task can only be assigned to an Employee or Manager');
      }

      if (!user.company?.id) {
        throw new BadRequestException(
          'Assigned employee must be associated with a company',
        );
      }
    }

    // Validate project
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['company', 'company.owner'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    // Only check company association for non-Admin roles
    if (authUser.role.name !== 'Admin' && !project.company?.id) {
      throw new BadRequestException(
        'Project must be associated with a company',
      );
    }

    // Authorization checks
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

      // For Manager, validate that assigned user is an Employee from the same company
      if (user) {
        if (user.company.id !== authUserWithCompany.company.id) {
          throw new ForbiddenException(
            `Access denied: You can only assign tasks to employees in your own company.`,
          );
        }

        if (!['Employee', 'Manager'].includes(user.role?.name)) {
          throw new BadRequestException('Task can only be assigned to an Employee or Manager');
        }
      }
    }

    // Create and save the task
    const newTask = this.taskRepo.create({
      title,
      description,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      priority: priority || undefined,
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

    // Validate time logic for updates
    const now = new Date();
    if (updateTaskDto.startTime) {
      const startDate = new Date(updateTaskDto.startTime);
      if (startDate < now) {
        throw new BadRequestException('Start time cannot be in the past');
      }
    }
    if (updateTaskDto.endTime) {
      const endDate = new Date(updateTaskDto.endTime);
      if (endDate < now) {
        throw new BadRequestException('End time cannot be in the past');
      }
    }
    if (updateTaskDto.startTime && updateTaskDto.endTime) {
      const startDate = new Date(updateTaskDto.startTime);
      const endDate = new Date(updateTaskDto.endTime);
      if (endDate < startDate) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    // Check for existing task with same time range (excluding current task)
    if (updateTaskDto.startTime && updateTaskDto.endTime) {
      const existingTask = await this.taskRepo.findOne({
        where: {
          project: { id: task.project.id },
          startTime: new Date(updateTaskDto.startTime),
          endTime: new Date(updateTaskDto.endTime),
          title: updateTaskDto.title || task.title,
          id: Not(id), // Exclude current task from check
        },
      });

      if (existingTask) {
        throw new BadRequestException('A task with the same time range already exists');
      }
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
    if (updateTaskDto.priority !== undefined) {
      task.priority = updateTaskDto.priority;
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

      if (newAssignedUser.role?.name !== 'Employee' && newAssignedUser.role?.name !== 'Manager') {
        throw new BadRequestException(
          'Task can only be assigned to an Employee or Manager',
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
