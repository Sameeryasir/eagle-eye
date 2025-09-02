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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logs = void 0;
const typeorm_1 = require("typeorm");
const users_entity_1 = require("./users.entity");
const tasks_entity_1 = require("./tasks.entity");
const images_entity_1 = require("./images.entity");
let Logs = class Logs {
    id;
    note;
    createdAt;
    user;
    tasks;
    images;
};
exports.Logs = Logs;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Logs.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Logs.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Logs.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.Users, (user) => user.logs, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", users_entity_1.Users)
], Logs.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tasks_entity_1.Tasks, (task) => task.log),
    __metadata("design:type", Array)
], Logs.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => images_entity_1.Images, (image) => image.log, { cascade: true }),
    __metadata("design:type", Array)
], Logs.prototype, "images", void 0);
exports.Logs = Logs = __decorate([
    (0, typeorm_1.Entity)()
], Logs);
//# sourceMappingURL=logs.entity.js.map