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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const task_service_1 = require("./task.service");
const create_task_dto_1 = require("./taskDto/create-task.dto");
const task_filter_dto_1 = require("./taskDto/task-filter.dto");
const passport_1 = require("@nestjs/passport");
const update_task_dto_1 = require("./taskDto/update-task.dto");
let TaskController = class TaskController {
    taskService;
    constructor(taskService) {
        this.taskService = taskService;
    }
    async getTask(req) {
        const user = req.user;
        const tasks = await this.taskService.getTask(user);
        return tasks;
    }
    async getEmployeesToAssingeTask(req) {
        const user = req.user;
        const employees = await this.taskService.getEmployeesToAssingeTask(user);
        return employees;
    }
    async getTaskById(id, req) {
        const user = req.user;
        const task = await this.taskService.getTaskById(Number(id), user);
        return task;
    }
    async getTodaysTask(req) {
        const user = req.user;
        const tasks = await this.taskService.getTodaysTask(user);
        return tasks;
    }
    async getTaskByProjectId(id, req) {
        const user = req.user;
        const projectId = Number(id);
        if (Number.isNaN(projectId)) {
            throw new common_1.BadRequestException('Invalid project id');
        }
        const tasks = await this.taskService.getTaskByProjectId(projectId, user);
        return tasks;
    }
    async getLogsByProjectId(id, req) {
        const user = req.user;
        const projectId = Number(id);
        if (Number.isNaN(projectId)) {
            throw new common_1.BadRequestException('Invalid project id');
        }
        const tasks = await this.taskService.getLogsByProjectId(projectId, user);
        return tasks;
    }
    async filterTasks(body, req) {
        const user = req.user;
        const tasks = await this.taskService.filterTasks(body, user);
        return tasks;
    }
    async createTask(createTaskDto, req) {
        const user = req.user;
        const task = await this.taskService.createTask(createTaskDto, user);
        return task;
    }
    async updateTask(id, updateTaskDto, req) {
        const user = req.user;
        const task = await this.taskService.updateTaskById(updateTaskDto, user, Number(id));
        return task;
    }
    async assignTaskToUser(id, body, req) {
        if (!body || typeof body.assignedToUserId !== 'number') {
            throw new common_1.BadRequestException('assignedToUserId (number) is required');
        }
        const user = req.user;
        const task = await this.taskService.assignTaskToUser(Number(id), body.assignedToUserId, user);
        return task;
    }
    async deleteTask(id, req) {
        const user = req.user;
        const task = await this.taskService.deleteTask(Number(id), user);
        return task;
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTask", null);
__decorate([
    (0, common_1.Get)('assignTo'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getEmployeesToAssingeTask", null);
__decorate([
    (0, common_1.Get)('by-id/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTaskById", null);
__decorate([
    (0, common_1.Get)('todays'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTodaysTask", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTaskByProjectId", null);
__decorate([
    (0, common_1.Get)('logs-filter/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getLogsByProjectId", null);
__decorate([
    (0, common_1.Post)('filter'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_filter_dto_1.TaskFilterDto, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "filterTasks", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "createTask", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_task_dto_1.UpdateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Post)('assign/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "assignTaskToUser", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "deleteTask", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.Controller)('task'),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
//# sourceMappingURL=task.controller.js.map