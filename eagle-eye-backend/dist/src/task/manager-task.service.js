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
exports.ManagerTaskService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tasks_entity_1 = require("../entities/tasks.entity");
const users_entity_1 = require("../entities/users.entity");
const projects_entity_1 = require("../entities/projects.entity");
const companies_entity_1 = require("../entities/companies.entity");
let ManagerTaskService = class ManagerTaskService {
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
    checkManager(user) {
        this.checkAuth(user);
        if (!user.role || user.role.name !== 'Manager') {
            throw new common_1.UnauthorizedException('Only Manager can access this resource');
        }
    }
    async getProjectTasksAssignedToEmployees(projectId, authUser) {
        this.checkManager(authUser);
        if (projectId === null || projectId === undefined || Number.isNaN(Number(projectId))) {
            throw new common_1.BadRequestException('Invalid project id');
        }
        const project = await this.projectRepo.findOne({
            where: { id: Number(projectId) },
            relations: ['company'],
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const managerWithCompany = await this.userRepo.findOne({
            where: { id: authUser.id },
            relations: ['company'],
        });
        if (!managerWithCompany?.company?.id) {
            throw new common_1.ForbiddenException('Manager must be associated with a company');
        }
        if (project.company?.id !== managerWithCompany.company.id) {
            throw new common_1.ForbiddenException('Access denied: Project is not in your company');
        }
        const tasks = await this.taskRepo.find({
            where: {
                project: { id: Number(projectId) },
                assignedTo: { role: { name: 'Employee' } },
            },
            relations: ['project', 'project.company', 'assignedTo', 'assignedTo.role'],
            order: { startTime: 'ASC' },
        });
        return tasks;
    }
};
exports.ManagerTaskService = ManagerTaskService;
exports.ManagerTaskService = ManagerTaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tasks_entity_1.Tasks)),
    __param(1, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __param(2, (0, typeorm_1.InjectRepository)(projects_entity_1.Projects)),
    __param(3, (0, typeorm_1.InjectRepository)(companies_entity_1.Companies)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ManagerTaskService);
//# sourceMappingURL=manager-task.service.js.map