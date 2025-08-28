import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Projects } from 'src/entities/projects.entity';
import { Repository, MoreThanOrEqual,LessThanOrEqual } from 'typeorm';
import { Roles } from 'src/entities/roles.entity';
import { CreateProjectDto } from './projectDto/create-project.dto';
import { UpdateProjectDto } from './projectDto/update-project.dto';
import { Companies } from 'src/entities/companies.entity';
import { Users } from 'src/entities/users.entity';
interface AuthenticatedUser {
  id: number;
  email: string;
  role: Roles;
}
@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Projects) private projectRepo: Repository<Projects>,
    @InjectRepository(Companies) private companyRepo: Repository<Companies>,
    @InjectRepository(Users) private userRepo: Repository<Users>,
  ) {}
  private checkAuth(user: AuthenticatedUser) {
    if (!user || !user.id) {
      throw new UnauthorizedException('Login required');
    }
  }

  private checkAdmin(user: AuthenticatedUser) {
    this.checkAuth(user);
    if (!user.role || !['Admin', 'Owner', 'Manager', 'Employee'].includes(user.role.name)) {
      throw new UnauthorizedException(
        'you are unauthorized to perform this action',
      );
    }
  }

  async getProjects(authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);
  
    let projects;
    
    if (authUser.role.name === 'Manager') {
      // For Managers, fetch projects where they are assigned
      projects = await this.projectRepo.find({
        where: {
          assignedTo: { id: authUser.id },
        },
        relations: ['tasks', 'tasks.assignedTo', 'tasks.log', 'tasks.log.images'],
        order: {
          id: 'DESC', // Newest projects first
        },
      });
    } else if (authUser.role.name === 'Owner') {
      // For Owners, fetch projects from their own company
      const ownerUser = await this.userRepo.findOne({
        where: { id: authUser.id },
        relations: ['company'],
      });

      if (!ownerUser?.company) {
        throw new BadRequestException('Owner must be associated with a company');
      }

      projects = await this.projectRepo.find({
        where: {
          company: { id: ownerUser.company.id },
        },
        relations: ['tasks', 'tasks.assignedTo', 'tasks.log', 'tasks.log.images'],
        order: {
          id: 'DESC', // Newest projects first
        },
      });
    } else if (authUser.role.name === 'Employee') {
      // For Employees, fetch projects that have tasks assigned to them
      projects = await this.projectRepo.find({
        where: {
          tasks: {
            assignedTo: { id: authUser.id },
          },
        },
        relations: ['tasks', 'tasks.assignedTo', 'tasks.log', 'tasks.log.images'],
        order: {
          id: 'DESC', // Newest projects first
        },
      });
    } else {
      // For Admins, fetch all projects
      projects = await this.projectRepo.find({
        relations: ['tasks', 'tasks.assignedTo'],
        order: {
          id: 'DESC', // Newest projects first
        },
      });
    }
  
    return projects;
  }
  


  async getProjectById(id: number, authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);
    const project = await this.projectRepo.findOne({
      where: { id: id },
      relations: ['owner', 'company', 'company.owner','tasks' ,'tasks.assignedTo', 'tasks.log', 'tasks.log.images'],
    });
    return project;
  }
  async createProject(
    createProjectDto: CreateProjectDto,
    authUser: AuthenticatedUser,
  ) {
    this.checkAdmin(authUser);
    const { name, description, startDate, company_id } =
      createProjectDto;

    // Fetch user and role
    const user = await this.userRepo.findOne({
      where: { id: authUser?.id },
      relations: ['role', 'company'],
    });

    if (!user) {
      throw new BadRequestException('user not found');
    }

    const userRole = user.role?.name;

    if (userRole !== 'Owner' && userRole !== 'Admin') {
      throw new ForbiddenException(
        'Only Admins and Owners can create projects',
      );
    }

    let company;
    if (userRole === 'Owner') {
      if (!user.company) {
        throw new BadRequestException(
          'Owner must be associated with a company',
        );
      }
      company = await this.companyRepo.findOne({
        where: { id: user.company.id },
        relations: ['owner'],
      });
    } else {
      // For Admin, use the provided company_id
      if (!company_id) {
        throw new BadRequestException('Company is required for Admin');
      }
      company = await this.companyRepo.findOne({
        where: { id: company_id },
        relations: ['owner'],
      });
    }

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Check if start date is already taken by another project
 

    // Create project
    const newProject = this.projectRepo.create({
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      owner: user,
      company,
    });

    return await this.projectRepo.save(newProject);
  }
  async updateProject(
    id: number,
    updateProjectDto: UpdateProjectDto,
    authUser: AuthenticatedUser,
  ) {
    this.checkAdmin(authUser);

    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['owner', 'company', 'company.owner'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const roleName = authUser.role?.name;

    // Authorization
    if (roleName === 'Owner') {
      if (project.company?.owner?.id !== authUser.id) {
        throw new ForbiddenException(
          'You can only update projects from your own company',
        );
      }
    } else if (roleName !== 'Admin') {
      throw new ForbiddenException(
        'Only Admins and Owners can update projects',
      );
    }

    // Update common fields
    if (updateProjectDto.name) {
      project.name = updateProjectDto.name;
    }
    if (updateProjectDto.description !== undefined) {
      project.description = updateProjectDto.description;
    }
    if (updateProjectDto.startDate) {
      project.startDate = new Date(updateProjectDto.startDate);
    }


    // Allow Admin to update company
    if (roleName === 'Admin' && updateProjectDto.companyId) {
      const newCompany = await this.companyRepo.findOne({
        where: { id: updateProjectDto.companyId },
      });
      if (!newCompany) {
        throw new BadRequestException('Invalid company ID');
      }
      project.company = newCompany;
    }

    return await this.projectRepo.save(project);
  }

  async deleteProject(id: number, authUser: AuthenticatedUser) {
    // Fetch project with relations for permission checks
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['owner', 'company', 'company.owner'], // Ensure company.owner is loaded
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const roleName = authUser.role?.name;

    // Authorization logic
    if (roleName === 'Owner') {
      // Owner can delete only their own company's projects
      if (project.company?.owner?.id !== authUser.id) {
        throw new ForbiddenException(
          'You can only delete projects from your own company',
        );
      }
    } else if (roleName === 'Admin') {
      // Admin can delete any project — no extra check needed
    } else {
      // Other roles are not allowed
      throw new ForbiddenException(
        'Only Admins and Owners can delete projects',
      );
    }

    // Delete project
    await this.projectRepo.remove(project);
    return project;
  }
}
