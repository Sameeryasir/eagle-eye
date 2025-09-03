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
exports.LogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const logs_entity_1 = require("../entities/logs.entity");
const tasks_entity_1 = require("../entities/tasks.entity");
const users_entity_1 = require("../entities/users.entity");
const typeorm_2 = require("typeorm");
let LogService = class LogService {
    logrepo;
    taskrepo;
    userrepo;
    constructor(logrepo, taskrepo, userrepo) {
        this.logrepo = logrepo;
        this.taskrepo = taskrepo;
        this.userrepo = userrepo;
    }
    checkAuth(user) {
        if (!user || !user.id) {
            throw new common_1.UnauthorizedException('Login required');
        }
    }
    checkAdmin(user) {
        this.checkAuth(user);
        if (!user.role || !['Employee', 'Manager'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('you are unauthorized to perform this action');
        }
    }
    async createLog(createLogDto, authUser) {
        this.checkAdmin(authUser);
        const user = await this.userrepo.findOne({
            where: { id: authUser.id },
            relations: ['role']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.role || !['Employee', 'Manager'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('User does not have required role');
        }
        const taskIds = Array.isArray(createLogDto.task_id) ? createLogDto.task_id : [createLogDto.task_id];
        const projectId = createLogDto.project_id;
        const tasks = await this.taskrepo.find({
            where: { id: (0, typeorm_2.In)(taskIds) },
            relations: ['project']
        });
        if (tasks.length !== taskIds.length) {
            const foundTaskIds = tasks.map(task => task.id);
            const missingTaskIds = taskIds.filter(id => !foundTaskIds.includes(id));
            throw new common_1.NotFoundException(`Tasks not found: ${missingTaskIds.join(', ')}`);
        }
        const tasksNotInProject = tasks.filter(task => task.project?.id !== projectId);
        if (tasksNotInProject.length > 0) {
            const invalidTaskIds = tasksNotInProject.map(task => task.id);
            throw new common_1.BadRequestException(`Tasks ${invalidTaskIds.join(', ')} do not belong to project ${projectId}`);
        }
        const tasksWithoutProject = tasks.filter(task => !task.project?.id);
        if (tasksWithoutProject.length > 0) {
            const unassignedTaskIds = tasksWithoutProject.map(task => task.id);
            throw new common_1.BadRequestException(`Tasks ${unassignedTaskIds.join(', ')} are not assigned to any project`);
        }
        const existingLogs = await this.logrepo.find({
            where: {
                user: { id: user.id },
                tasks: { id: (0, typeorm_2.In)(taskIds) }
            },
            relations: ['tasks']
        });
        if (existingLogs.length > 0) {
            const tasksWithLogs = existingLogs.flatMap(log => log.tasks.map(task => task.id));
            const duplicateTaskIds = taskIds.filter(id => tasksWithLogs.includes(id));
            throw new common_1.BadRequestException(`You can create One log against one project. Tasks ${duplicateTaskIds.join(', ')} already have logs.`);
        }
        const log = this.logrepo.create({
            note: createLogDto.note,
            user: user,
            tasks: tasks
        });
        const savedLog = await this.logrepo.save(log);
        return {
            message: `Successfully created log with ${tasks.length} task(s)`,
            log: savedLog
        };
    }
    async getLogs(authUser) {
        this.checkAdmin(authUser);
        const user = await this.userrepo.findOne({
            where: { id: authUser.id },
            relations: ['role']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.role || !['Employee', 'Manager'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('User does not have required role');
        }
        const logs = await this.logrepo.find({
            where: { user: { id: user.id } },
            relations: ['user', 'tasks', 'tasks.project', 'tasks.project.tasks', 'tasks.project.tasks.assignedTo', 'tasks.project.tasks.log', 'tasks.project.tasks.log.images', 'images'],
            order: { createdAt: 'DESC' }
        });
        return logs;
    }
    async updateLog(logId, updateLogDto, authUser) {
        const user = await this.userrepo.findOne({
            where: { id: authUser.id },
            relations: ['role']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.role || !['Employee', 'Manager', 'Owner'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('User does not have required role');
        }
        const log = await this.logrepo.findOne({
            where: { id: logId },
            relations: ['user', 'tasks']
        });
        if (!log) {
            throw new common_1.NotFoundException('Log not found');
        }
        if (updateLogDto.note) {
            log.note = updateLogDto.note;
        }
        else {
            throw new common_1.BadRequestException('Enter the Log to update');
        }
        return await this.logrepo.save(log);
    }
    async deleteLog(logId, authUser) {
        const user = await this.userrepo.findOne({
            where: { id: authUser.id },
            relations: ['role']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.role || !['Employee', 'Manager', 'Owner'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('User does not have required role');
        }
        const log = await this.logrepo.findOne({
            where: { id: logId },
            relations: ['user', 'tasks']
        });
        if (!log) {
            throw new common_1.NotFoundException('Log not found');
        }
        await this.logrepo.remove(log);
        return log;
    }
    async getLogById(logId, authUser) {
        const user = await this.userrepo.findOne({
            where: { id: authUser.id },
            relations: ['role']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.role || !['Employee', 'Manager', 'Owner'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('User does not have required role');
        }
        const log = await this.logrepo.findOne({
            where: { id: logId },
            relations: ['user', 'tasks', 'tasks.project', 'tasks.assignedTo', 'images']
        });
        if (!log) {
            throw new common_1.NotFoundException('Log not found');
        }
        return log;
    }
};
exports.LogService = LogService;
exports.LogService = LogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(logs_entity_1.Logs)),
    __param(1, (0, typeorm_1.InjectRepository)(tasks_entity_1.Tasks)),
    __param(2, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LogService);
//# sourceMappingURL=log.service.js.map