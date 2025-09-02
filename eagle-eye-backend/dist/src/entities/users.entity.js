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
exports.Users = void 0;
const typeorm_1 = require("typeorm");
const otps_entity_1 = require("./otps.entity");
const roles_entity_1 = require("./roles.entity");
const companies_entity_1 = require("./companies.entity");
const projects_entity_1 = require("./projects.entity");
const tasks_entity_1 = require("./tasks.entity");
const logs_entity_1 = require("./logs.entity");
let Users = class Users {
    id;
    email;
    first_name;
    last_name;
    title;
    dob;
    phone;
    otp;
    role;
    createdBy;
    company;
    ownedProjects;
    tasks;
    logs;
};
exports.Users = Users;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Users.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Users.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Users.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Users.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Users.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Users.prototype, "dob", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 15, unique: true, nullable: true }),
    __metadata("design:type", String)
], Users.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => otps_entity_1.Otps, (otp) => otp.user),
    __metadata("design:type", otps_entity_1.Otps)
], Users.prototype, "otp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => roles_entity_1.Roles, (role) => role.users),
    (0, typeorm_1.JoinColumn)({ name: 'roleId' }),
    __metadata("design:type", roles_entity_1.Roles)
], Users.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_user_id' }),
    __metadata("design:type", Users)
], Users.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => companies_entity_1.Companies, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", companies_entity_1.Companies)
], Users.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => projects_entity_1.Projects, (project) => project.owner),
    __metadata("design:type", Array)
], Users.prototype, "ownedProjects", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tasks_entity_1.Tasks, (task) => task.assignedTo),
    __metadata("design:type", Array)
], Users.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => logs_entity_1.Logs, (log) => log.user),
    __metadata("design:type", Array)
], Users.prototype, "logs", void 0);
exports.Users = Users = __decorate([
    (0, typeorm_1.Entity)()
], Users);
//# sourceMappingURL=users.entity.js.map