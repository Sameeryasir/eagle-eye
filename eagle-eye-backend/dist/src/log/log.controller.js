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
exports.LogController = void 0;
const common_1 = require("@nestjs/common");
const log_service_1 = require("./log.service");
const create_log_dto_1 = require("./logDto/create-log.dto");
const update_log_dto_1 = require("./logDto/update-log.dto");
const passport_1 = require("@nestjs/passport");
let LogController = class LogController {
    logService;
    constructor(logService) {
        this.logService = logService;
    }
    async getLogs(projectId, req) {
        const user = req.user;
        const logs = await this.logService.getLogs(user, Number(projectId));
        return logs;
    }
    async getRecentLogsForOwner(projectId, req) {
        const user = req.user;
        const logs = await this.logService.getRecentLogsForOwner(user, Number(projectId));
        return logs;
    }
    async createLog(createLogDto, req) {
        const user = req.user;
        const newLog = await this.logService.createLog(createLogDto, user);
        return newLog;
    }
    async getLogById(id, req) {
        const user = req.user;
        const log = await this.logService.getLogById(Number(id), user);
        return log;
    }
    async updateLog(id, updateLogDto, req) {
        const user = req.user;
        const updatedLog = await this.logService.updateLog(Number(id), updateLogDto, user);
        return updatedLog;
    }
    async deleteLog(id, req) {
        const user = req.user;
        const result = await this.logService.deleteLog(Number(id), user);
        return result;
    }
};
exports.LogController = LogController;
__decorate([
    (0, common_1.Get)(':projectId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('owner/recent/:projectId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getRecentLogsForOwner", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_log_dto_1.CreateLogDto, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "createLog", null);
__decorate([
    (0, common_1.Get)('singleLog/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getLogById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_log_dto_1.UpdateLogDto, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "updateLog", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "deleteLog", null);
exports.LogController = LogController = __decorate([
    (0, common_1.Controller)('log'),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogController);
//# sourceMappingURL=log.controller.js.map