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
exports.Companies = void 0;
const typeorm_1 = require("typeorm");
const users_entity_1 = require("./users.entity");
const projects_entity_1 = require("./projects.entity");
let Companies = class Companies {
    id;
    name;
    address;
    city;
    state;
    country;
    owner;
    projects;
};
exports.Companies = Companies;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Companies.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Companies.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Companies.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Companies.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Companies.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'USA' }),
    __metadata("design:type", String)
], Companies.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => users_entity_1.Users, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'owner_user_id' }),
    __metadata("design:type", users_entity_1.Users)
], Companies.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => projects_entity_1.Projects, (project) => project.company),
    __metadata("design:type", Array)
], Companies.prototype, "projects", void 0);
exports.Companies = Companies = __decorate([
    (0, typeorm_1.Entity)()
], Companies);
//# sourceMappingURL=companies.entity.js.map