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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const projects_entity_1 = require("../entities/projects.entity");
const typeorm_2 = require("typeorm");
const companies_entity_1 = require("../entities/companies.entity");
const users_entity_1 = require("../entities/users.entity");
let ProjectService = class ProjectService {
    projectRepo;
    companyRepo;
    userRepo;
    constructor(projectRepo, companyRepo, userRepo) {
        this.projectRepo = projectRepo;
        this.companyRepo = companyRepo;
        this.userRepo = userRepo;
    }
    checkAuth(user) {
        if (!user || !user.id) {
            throw new common_1.UnauthorizedException('Login required');
        }
    }
    checkAdmin(user) {
        this.checkAuth(user);
        if (!user.role ||
            !['Admin', 'Owner', 'Manager', 'Employee'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('you are unauthorized to perform this action');
        }
    }
    async getProjects(authUser) {
        this.checkAdmin(authUser);
        let projects;
        if (authUser.role.name === 'Manager') {
            projects = await this.projectRepo.find({
                where: {
                    assignedTo: { id: authUser.id },
                },
                relations: [
                    'tasks',
                    'tasks.assignedTo',
                    'tasks.log',
                    'tasks.log.images',
                ],
                order: {
                    id: 'DESC',
                },
            });
        }
        else if (authUser.role.name === 'Owner') {
            const ownerUser = await this.userRepo.findOne({
                where: { id: authUser.id },
                relations: ['company'],
            });
            if (!ownerUser?.company) {
                throw new common_1.BadRequestException('Owner must be associated with a company');
            }
            projects = await this.projectRepo.find({
                where: {
                    company: { id: ownerUser.company.id },
                },
                relations: [
                    'tasks',
                    'tasks.assignedTo',
                    'tasks.log',
                    'tasks.log.images',
                ],
                order: {
                    id: 'DESC',
                },
            });
        }
        else if (authUser.role.name === 'Employee') {
            projects = await this.projectRepo.find({
                where: {
                    tasks: {
                        assignedTo: { id: authUser.id },
                    },
                },
                relations: [
                    'tasks',
                    'tasks.assignedTo',
                    'tasks.log',
                    'tasks.log.images',
                ],
                order: {
                    id: 'DESC',
                },
            });
        }
        else {
            projects = await this.projectRepo.find({
                relations: ['tasks', 'tasks.assignedTo'],
                order: {
                    id: 'DESC',
                },
            });
        }
        return projects;
    }
    async getProjectById(id, authUser) {
        this.checkAdmin(authUser);
        const roleName = authUser.role?.name;
        let project;
        if (roleName === 'Manager') {
            project = await this.projectRepo.findOne({
                where: { id: id, assignedTo: { id: authUser.id } },
                relations: [
                    'owner',
                    'company',
                    'company.owner',
                    'assignedTo',
                    'tasks',
                    'tasks.assignedTo',
                    'tasks.log',
                    'tasks.log.images',
                ],
            });
        }
        else if (roleName === 'Employee') {
            project = await this.projectRepo.findOne({
                where: { id: id, tasks: { assignedTo: { id: authUser.id } } },
                relations: [
                    'owner',
                    'company',
                    'company.owner',
                    'tasks',
                    'tasks.assignedTo',
                    'tasks.log',
                    'tasks.log.images',
                ],
            });
        }
        else {
            project = await this.projectRepo.findOne({
                where: { id: id },
                relations: [
                    'owner',
                    'company',
                    'company.owner',
                    'tasks',
                    'tasks.assignedTo',
                    'tasks.log',
                    'tasks.log.images',
                ],
            });
        }
        return project;
    }
    async createProject(createProjectDto, authUser) {
        this.checkAdmin(authUser);
        const { name, description, startDate, company_id, assignedTo: assignedToUserId, } = createProjectDto;
        const user = await this.userRepo.findOne({
            where: { id: authUser?.id },
            relations: ['role', 'company'],
        });
        if (!user) {
            throw new common_1.BadRequestException('user not found');
        }
        const userRole = user.role?.name;
        if (userRole !== 'Owner' && userRole !== 'Admin') {
            throw new common_1.ForbiddenException('Only Admins and Owners can create projects');
        }
        let company;
        if (userRole === 'Owner') {
            if (!user.company) {
                throw new common_1.BadRequestException('Owner must be associated with a company');
            }
            company = await this.companyRepo.findOne({
                where: { id: user.company.id },
                relations: ['owner'],
            });
        }
        else {
            if (!company_id) {
                throw new common_1.BadRequestException('Company is required for Admin');
            }
            company = await this.companyRepo.findOne({
                where: { id: company_id },
                relations: ['owner'],
            });
        }
        if (!company) {
            throw new common_1.BadRequestException('Company not found');
        }
        if (startDate) {
            const start = new Date(startDate);
            const now = new Date();
            if (start.getTime() < now.getTime()) {
                throw new common_1.BadRequestException('Start date cannot be in the past');
            }
        }
        let assignedManager = null;
        if (assignedToUserId) {
            assignedManager = await this.userRepo.findOne({
                where: { id: assignedToUserId },
                relations: ['role', 'company', 'company.owner'],
            });
            if (!assignedManager) {
                throw new common_1.NotFoundException('Assigned manager not found');
            }
            if (assignedManager.role?.name !== 'Manager') {
                throw new common_1.BadRequestException('Project can only be assigned to a Manager');
            }
            if (!assignedManager.company?.id) {
                throw new common_1.BadRequestException('Assigned manager must be associated with a company');
            }
            if (assignedManager.company.id !== company.id) {
                throw new common_1.ForbiddenException('Assigned manager must belong to the same company as the project');
            }
        }
        const newProject = this.projectRepo.create({
            name,
            description,
            startDate: startDate ? new Date(startDate) : undefined,
            owner: user,
            company,
            assignedTo: assignedManager || undefined,
        });
        return await this.projectRepo.save(newProject);
    }
    async updateProject(id, updateProjectDto, authUser) {
        this.checkAdmin(authUser);
        const project = await this.projectRepo.findOne({
            where: { id },
            relations: ['owner', 'company', 'company.owner'],
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const roleName = authUser.role?.name;
        if (roleName === 'Owner') {
            if (project.company?.owner?.id !== authUser.id) {
                throw new common_1.ForbiddenException('You can only update projects from your own company');
            }
        }
        else if (roleName !== 'Admin') {
            throw new common_1.ForbiddenException('Only Admins and Owners can update projects');
        }
        if (updateProjectDto.name) {
            project.name = updateProjectDto.name;
        }
        if (updateProjectDto.description !== undefined) {
            project.description = updateProjectDto.description;
        }
        if (updateProjectDto.startDate) {
            const newStart = new Date(updateProjectDto.startDate);
            const now = new Date();
            if (newStart.getTime() < now.getTime()) {
                throw new common_1.BadRequestException('Start date cannot be in the past');
            }
            project.startDate = newStart;
        }
        if (roleName === 'Admin' && updateProjectDto.companyId) {
            const newCompany = await this.companyRepo.findOne({
                where: { id: updateProjectDto.companyId },
            });
            if (!newCompany) {
                throw new common_1.BadRequestException('Invalid company ID');
            }
            project.company = newCompany;
        }
        if (updateProjectDto.assignedTo !== undefined) {
            const assignedToUserId = updateProjectDto.assignedTo;
            if (assignedToUserId === null) {
                project.assignedTo = null;
            }
            else {
                const newAssignedManager = await this.userRepo.findOne({
                    where: { id: assignedToUserId },
                    relations: ['role', 'company', 'company.owner'],
                });
                if (!newAssignedManager) {
                    throw new common_1.BadRequestException('Assigned manager not found');
                }
                if (newAssignedManager.role?.name !== 'Manager') {
                    throw new common_1.BadRequestException('Project can only be assigned to a Manager');
                }
                const targetCompanyId = project.company?.id;
                if (!targetCompanyId) {
                    throw new common_1.BadRequestException('Project must be associated with a company before assigning a manager');
                }
                if (!newAssignedManager.company?.id) {
                    throw new common_1.BadRequestException('Assigned manager must be associated with a company');
                }
                if (newAssignedManager.company.id !== targetCompanyId) {
                    throw new common_1.ForbiddenException('Assigned manager must belong to the same company as the project');
                }
                project.assignedTo = newAssignedManager;
            }
        }
        return await this.projectRepo.save(project);
    }
    async deleteProject(id, authUser) {
        const project = await this.projectRepo.findOne({
            where: { id },
            relations: ['owner', 'company', 'company.owner'],
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const roleName = authUser.role?.name;
        if (roleName === 'Owner') {
            if (project.company?.owner?.id !== authUser.id) {
                throw new common_1.ForbiddenException('You can only delete projects from your own company');
            }
        }
        else if (roleName === 'Admin') {
        }
        else {
            throw new common_1.ForbiddenException('Only Admins and Owners can delete projects');
        }
        await this.projectRepo.remove(project);
        return project;
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(projects_entity_1.Projects)),
    __param(1, (0, typeorm_1.InjectRepository)(companies_entity_1.Companies)),
    __param(2, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectService);
//# sourceMappingURL=project.service.js.map