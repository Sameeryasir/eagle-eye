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
exports.ManagerTaskController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const task_service_1 = require("./task.service");
let ManagerTaskController = class ManagerTaskController {
    taskService;
    constructor(taskService) {
        this.taskService = taskService;
    }
    async getManagerAssignedTasksByProject(projectId, req) {
        const id = Number(projectId);
        if (Number.isNaN(id)) {
            throw new common_1.BadRequestException('Invalid project id');
        }
        const user = req.user;
        return await this.taskService.getTasksAssignedToManagersByProject(id, user);
    }
};
exports.ManagerTaskController = ManagerTaskController;
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ManagerTaskController.prototype, "getManagerAssignedTasksByProject", null);
exports.ManagerTaskController = ManagerTaskController = __decorate([
    (0, common_1.Controller)('manager-task'),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], ManagerTaskController);
//# sourceMappingURL=manager-task.controller.js.map