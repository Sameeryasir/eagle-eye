"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tasks_entity_1 = require("../entities/tasks.entity");
const typeorm_2 = require("typeorm");
const users_entity_1 = require("../entities/users.entity");
const projects_entity_1 = require("../entities/projects.entity");
const typeorm_3 = require("typeorm");
const companies_entity_1 = require("../entities/companies.entity");
let TaskService = class TaskService {
    taskRepo;
    userRepo;
    projectRepo;
    companyRepo;
    constructor(taskRepo, userRepo, projectRepo, companyRepo) {
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
        this.projectRepo = projectRepo;
        this.companyRepo = companyRepo;
    }
    checkAuth(user) {
        if (!user || !user.id) {
            throw new common_1.UnauthorizedException('Login required');
        }
    }
    checkAdmin(user) {
        this.checkAuth(user);
        if (!user.role || !['Admin', 'Owner', 'Manager'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('you are unauthorized to perform this action');
        }
    }
    checkManagerAndEmployee(user) {
        this.checkAuth(user);
        if (!user.role || !['Manager', 'Employee'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('Only Manager and Employee roles can access this feature');
        }
    }
    async getTaskByProjectId(projectId, authUser) {
        this.checkAuth(authUser);
        const roleName = authUser.role?.name;
        if (!roleName || !['Manager', 'Employee', 'Owner'].includes(roleName)) {
            throw new common_1.UnauthorizedException('Only Manager, Owner, and Employee roles can access this feature');
        }
        if (projectId === null || projectId === undefined || Number.isNaN(Number(projectId))) {
            throw new common_1.BadRequestException('Invalid project id');
        }
        const project = await this.projectRepo.findOne({ where: { id: Number(projectId) } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const isEmployee = roleName === 'Employee';
        const isManager = roleName === 'Manager';
        const isOwner = roleName === 'Owner';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tasks = await this.taskRepo.find({
            where: isEmployee
                ? {
                    project: { id: projectId },
                    assignedTo: { id: authUser.id },
                    startTime: (0, typeorm_3.MoreThanOrEqual)(today),
                    log: (0, typeorm_3.IsNull)(),
                }
                : isManager
                    ? {
                        project: { id: projectId },
                        startTime: (0, typeorm_3.MoreThanOrEqual)(today),
                        log: (0, typeorm_3.IsNull)(),
                    }
                    : isOwner
                        ? {
                            project: { id: projectId },
                            startTime: (0, typeorm_3.MoreThanOrEqual)(today),
                            log: (0, typeorm_3.IsNull)(),
                        }
                        : { project: { id: projectId } },
            relations: ['project', 'assignedTo', 'log', 'log.images'],
            order: { id: 'DESC' },
        });
        return tasks;
    }
    async getLogsByProjectId(projectId, authUser) {
        this.checkAuth(authUser);
        const roleName = authUser.role?.name;
        if (!roleName || !['Manager', 'Employee', 'Owner'].includes(roleName)) {
            throw new common_1.UnauthorizedException('Only Manager, Owner, and Employee roles can access this feature');
        }
        if (projectId === null || projectId === undefined || Number.isNaN(Number(projectId))) {
            throw new common_1.BadRequestException('Invalid project id');
        }
        const project = await this.projectRepo.findOne({ where: { id: Number(projectId) } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const isEmployee = roleName === 'Employee';
        const isManager = roleName === 'Manager';
        const isOwner = roleName === 'Owner';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tasks = await this.taskRepo.find({
            where: isEmployee
                ? {
                    project: { id: projectId },
                    assignedTo: { id: authUser.id },
                }
                : isManager
                    ? {
                        project: { id: projectId },
                    }
                    : isOwner
                        ? {
                            project: { id: projectId },
                        }
                        : { project: { id: projectId } },
            relations: ['project', 'assignedTo', 'log', 'log.images'],
            order: { id: 'DESC' },
        });
        return tasks;
    }
    async getTask(authUser) {
        const tasks = await this.taskRepo.find({
            where: [
                {
                    assignedTo: { id: authUser.id },
                },
                {
                    assignedTo: { id: authUser.id },
                },
            ],
            relations: ['project', 'assignedTo', 'log', 'log.images'],
            order: { id: 'DESC' },
        });
        return tasks;
    }
    async getTodaysTask(authUser) {
        if (authUser.role.name !== 'Manager' && authUser.role.name !== 'Employee') {
            throw new common_1.UnauthorizedException('Only Manager and Employee roles can access this feature');
        }
        const tasks = await this.taskRepo.find({
            where: {
                assignedTo: { id: authUser.id },
            },
            relations: ['project', 'assignedTo', 'log', 'log.images'],
            order: { createdAt: 'DESC' },
        });
        return tasks;
    }
    async getEmployeesToAssingeTask(authUser) {
        this.checkAdmin(authUser);
        if (!authUser.id || isNaN(authUser.id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        let company;
        if (authUser.role.name === 'Owner') {
            company = await this.companyRepo.findOne({
                where: {
                    owner: { id: authUser.id }
                }
            });
        }
        else if (authUser.role.name === 'Manager') {
            const managerUser = await this.userRepo.findOne({
                where: { id: authUser.id },
                relations: ['company']
            });
            if (!managerUser?.company) {
                throw new common_1.NotFoundException('Manager must be associated with a company');
            }
            company = managerUser.company;
        }
        else {
            throw new common_1.ForbiddenException('Only Owners and Managers can fetch employees');
        }
        if (!company) {
            throw new common_1.NotFoundException('Company not found for this user');
        }
        let employees;
        if (authUser.role.name === 'Manager') {
            employees = await this.userRepo.find({
                where: {
                    company: { id: company.id },
                    role: { name: 'Employee' }
                },
                relations: ['role'],
                select: ['id', 'first_name', 'last_name', 'email', 'phone']
            });
        }
        else if (authUser.role.name === 'Owner') {
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
    async createTask(CreateTaskDto, authUser) {
        this.checkAdmin(authUser);
        const { title, description, startTime, minStartTime, endTime, priority, projectId, assignedToUserId, } = CreateTaskDto;
        if (!startTime) {
            throw new common_1.BadRequestException('Start time is required');
        }
        if (startTime && minStartTime) {
            const startDate = new Date(startTime);
            const minStart = new Date(minStartTime);
            if (startDate <= minStart) {
                throw new common_1.BadRequestException('Start time cannot be before the draft start time');
            }
        }
        if (startTime && endTime) {
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);
            if (endDate < startDate) {
                throw new common_1.BadRequestException('End time must be after start time');
            }
        }
        if (!projectId) {
            throw new common_1.BadRequestException('Project is required');
        }
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
                throw new common_1.BadRequestException('A task with the same time range already exists');
            }
        }
        let user = null;
        if (assignedToUserId) {
            user = await this.userRepo.findOne({
                where: { id: assignedToUserId },
                relations: ['company', 'role'],
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (!['Employee', 'Manager'].includes(user.role?.name)) {
                throw new common_1.BadRequestException('Task can only be assigned to an Employee or Manager');
            }
            if (!user.company?.id) {
                throw new common_1.BadRequestException('Assigned employee must be associated with a company');
            }
        }
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['company', 'company.owner'],
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (authUser.role.name !== 'Admin' && !project.company?.id) {
            throw new common_1.BadRequestException('Project must be associated with a company');
        }
        if (authUser.role.name === 'Owner') {
            if (!project.company.owner?.id) {
                throw new common_1.ForbiddenException('Project company has no owner');
            }
            if (project.company.owner.id !== authUser.id) {
                throw new common_1.ForbiddenException(`Access denied: You can only create tasks for projects in your own company.`);
            }
            if (user && user.company.id !== project.company.id) {
                throw new common_1.ForbiddenException(`Access denied: You can only assign tasks to employees in your own company.`);
            }
        }
        else if (authUser.role.name === 'Manager') {
            const authUserWithCompany = await this.userRepo.findOne({
                where: { id: authUser.id },
                relations: ['company'],
            });
            if (!authUserWithCompany?.company?.id) {
                throw new common_1.ForbiddenException('You must be associated with a company to create tasks');
            }
            if (authUserWithCompany.company.id !== project.company.id) {
                throw new common_1.ForbiddenException(`Access denied: You can only create tasks for projects in your own company.`);
            }
            if (user) {
                if (user.company.id !== authUserWithCompany.company.id) {
                    throw new common_1.ForbiddenException(`Access denied: You can only assign tasks to employees in your own company.`);
                }
                if (!['Employee', 'Manager'].includes(user.role?.name)) {
                    throw new common_1.BadRequestException('Task can only be assigned to an Employee or Manager');
                }
            }
        }
        const newTask = this.taskRepo.create({
            title,
            description,
            startTime: new Date(startTime),
            endTime: endTime ? new Date(endTime) : undefined,
            priority: priority || undefined,
            assignedTo: user || undefined,
            project,
        });
        return await this.taskRepo.save(newTask);
    }
    async updateTaskById(updateTaskDto, authUser, id) {
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
            throw new common_1.NotFoundException('Task not found');
        }
        const roleName = authUser.role?.name;
        if (roleName === 'Owner') {
            if (!task.project?.company?.owner?.id) {
                throw new common_1.ForbiddenException('Task is not associated with any company');
            }
            if (task.project.company.owner.id !== authUser.id) {
                throw new common_1.ForbiddenException(`Access denied: You can only update tasks from your own company`);
            }
        }
        else if (roleName === 'Manager') {
            const authUserWithCompany = await this.userRepo.findOne({
                where: { id: authUser.id },
                relations: ['company'],
            });
            if (!authUserWithCompany?.company?.id) {
                throw new common_1.ForbiddenException('You must be associated with a company to update tasks');
            }
            if (!task.project?.company?.id) {
                throw new common_1.ForbiddenException('Task is not associated with any company');
            }
            if (task.project.company.id !== authUserWithCompany.company.id) {
                throw new common_1.ForbiddenException(`Access denied: You can only update tasks in your own company.`);
            }
        }
        else if (roleName !== 'Admin') {
            throw new common_1.ForbiddenException('Only Admins, Owners, and Managers can update tasks');
        }
        const now = new Date();
        if (updateTaskDto.startTime) {
            const startDate = new Date(updateTaskDto.startTime);
            if (startDate < now) {
                throw new common_1.BadRequestException('Start time cannot be in the past');
            }
        }
        if (updateTaskDto.endTime) {
            const endDate = new Date(updateTaskDto.endTime);
            if (endDate < now) {
                throw new common_1.BadRequestException('End time cannot be in the past');
            }
        }
        if (updateTaskDto.startTime && updateTaskDto.endTime) {
            const startDate = new Date(updateTaskDto.startTime);
            const endDate = new Date(updateTaskDto.endTime);
            if (endDate < startDate) {
                throw new common_1.BadRequestException('End time must be after start time');
            }
        }
        if (updateTaskDto.startTime && updateTaskDto.endTime) {
            const existingTask = await this.taskRepo.findOne({
                where: {
                    project: { id: task.project.id },
                    startTime: new Date(updateTaskDto.startTime),
                    endTime: new Date(updateTaskDto.endTime),
                    title: updateTaskDto.title || task.title,
                    id: (0, typeorm_3.Not)(id),
                },
            });
            if (existingTask) {
                throw new common_1.BadRequestException('A task with the same time range already exists');
            }
        }
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
        if (updateTaskDto.projectId) {
            const newProject = await this.projectRepo.findOne({
                where: { id: updateTaskDto.projectId },
                relations: ['company', 'company.owner'],
            });
            if (!newProject) {
                throw new common_1.BadRequestException('Invalid project ID');
            }
            if (roleName === 'Owner') {
                if (!newProject.company?.owner?.id) {
                    throw new common_1.ForbiddenException('Project is not associated with any company');
                }
                if (newProject.company.owner.id !== authUser.id) {
                    throw new common_1.ForbiddenException(`Access denied: You can only update tasks to projects in your own company.`);
                }
            }
            else if (roleName === 'Manager') {
                const authUserWithCompany = await this.userRepo.findOne({
                    where: { id: authUser.id },
                    relations: ['company'],
                });
                if (!authUserWithCompany?.company?.id) {
                    throw new common_1.ForbiddenException('You must be associated with a company to assign tasks to projects');
                }
                if (!newProject.company?.id) {
                    throw new common_1.ForbiddenException('Project is not associated with any company');
                }
                if (newProject.company.id !== authUserWithCompany.company.id) {
                    throw new common_1.ForbiddenException(`Access denied: You can only assign tasks to projects in your own company. Your company ID: ${authUserWithCompany.company.id}, Project company ID: ${newProject.company.id}`);
                }
            }
            task.project = newProject;
        }
        if (updateTaskDto.assignedToUserId) {
            const newAssignedUser = await this.userRepo.findOne({
                where: { id: updateTaskDto.assignedToUserId },
                relations: ['role', 'company', 'company.owner'],
            });
            if (!newAssignedUser) {
                throw new common_1.BadRequestException('Invalid assigned user ID');
            }
            if (newAssignedUser.role?.name !== 'Employee' && newAssignedUser.role?.name !== 'Manager') {
                throw new common_1.BadRequestException('Task can only be assigned to an Employee or Manager');
            }
            if (roleName === 'Owner') {
                if (!newAssignedUser.company?.id) {
                    throw new common_1.ForbiddenException('Assigned user is not associated with any company');
                }
                if (!newAssignedUser.company?.owner?.id) {
                    throw new common_1.ForbiddenException("Assigned user's company has no owner");
                }
                if (newAssignedUser.company.owner.id !== authUser.id) {
                    throw new common_1.ForbiddenException(`Access denied: You can only assign tasks to employees in your own company. Employee belongs to company ID: ${newAssignedUser.company.id}`);
                }
            }
            else if (roleName === 'Manager') {
                const authUserWithCompany = await this.userRepo.findOne({
                    where: { id: authUser.id },
                    relations: ['company'],
                });
                if (!authUserWithCompany?.company?.id) {
                    throw new common_1.ForbiddenException('You must be associated with a company to assign tasks');
                }
                if (!newAssignedUser.company?.id) {
                    throw new common_1.ForbiddenException('Assigned user is not associated with any company');
                }
                if (newAssignedUser.company.id !== authUserWithCompany.company.id) {
                    throw new common_1.ForbiddenException(`Access denied: You can only assign tasks to employees in your own company. Your company ID: ${authUserWithCompany.company.id}, Employee company ID: ${newAssignedUser.company.id}`);
                }
            }
            task.assignedTo = newAssignedUser;
        }
        return await this.taskRepo.save(task);
    }
    async deleteTask(id, authUser) {
        this.checkAdmin(authUser);
        const task = await this.taskRepo.findOne({
            where: {
                id: id,
            },
            relations: ['project', 'project.company', 'assignedTo'],
        });
        if (!task) {
            throw new common_1.NotFoundException('No task found');
        }
        await this.taskRepo.remove(task);
        return task;
    }
    async assignTaskToUser(taskId, assignedToUserId, authUser) {
        this.checkAdmin(authUser);
        const task = await this.taskRepo.findOne({ where: { id: taskId } });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        const assignee = await this.userRepo.findOne({ where: { id: assignedToUserId }, relations: ['role'] });
        if (!assignee) {
            throw new common_1.BadRequestException('Invalid assigned user ID');
        }
        if (!['Employee', 'Manager'].includes(assignee.role?.name)) {
            throw new common_1.BadRequestException('Task can only be assigned to an Employee or Manager');
        }
        task.assignedTo = { id: assignedToUserId };
        return await this.taskRepo.save(task);
    }
    async getTaskById(id, authUser) {
        if (!authUser?.role?.name || !['Owner', 'Manager', 'Employee'].includes(authUser.role.name)) {
            throw new common_1.UnauthorizedException('Only Owner, Manager, and Employee roles can access this feature');
        }
        const task = await this.taskRepo.findOne({
            where: { id },
            relations: ['project', 'project.company', 'assignedTo'],
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    async filterTasks(filter, authUser) {
        this.checkAuth(authUser);
        const sortBy = filter.sortBy || 'createdAt';
        const sortOrder = 'DESC';
        const isUpcomingSort = sortBy === 'startTime';
        const isUpcomingEnd = sortBy === 'endTime';
        const isCreatedAtSort = sortBy === 'createdAt';
        const now = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const where = { project: { id: filter.projectId } };
        if (filter.unassigned === true) {
            where.assignedTo = (0, typeorm_3.IsNull)();
        }
        else if (filter.assignedTo === 'me') {
            where.assignedTo = { id: authUser.id };
        }
        else if (filter.email) {
            where.assignedTo = { email: filter.email };
        }
        if (filter.closedTask === true) {
            where.endTime = (0, typeorm_2.LessThan)(startOfToday);
        }
        if (isUpcomingSort) {
            where.startTime = (0, typeorm_3.MoreThanOrEqual)(now);
        }
        else if (isUpcomingEnd) {
            where.endTime = (0, typeorm_3.Between)(startOfToday, endOfToday);
        }
        else if (isCreatedAtSort) {
        }
        const tasks = await this.taskRepo.find({
            where,
            relations: ['project', 'assignedTo', 'log', 'log.images'],
            order: isUpcomingSort
                ? { startTime: 'ASC' }
                : isUpcomingEnd
                    ? { endTime: 'ASC' }
                    : isCreatedAtSort
                        ? { createdAt: 'DESC' }
                        : { [sortBy]: sortOrder },
        });
        return tasks;
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tasks_entity_1.Tasks)),
    __param(1, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __param(2, (0, typeorm_1.InjectRepository)(projects_entity_1.Projects)),
    __param(3, (0, typeorm_1.InjectRepository)(companies_entity_1.Companies)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TaskService);
//# sourceMappingURL=task.service.js.map