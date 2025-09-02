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
exports.Images = void 0;
const typeorm_1 = require("typeorm");
const logs_entity_1 = require("./logs.entity");
let Images = class Images {
    id;
    fileName;
    size;
    imageUrl;
    createdAt;
    log;
};
exports.Images = Images;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Images.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], Images.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], Images.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: false }),
    __metadata("design:type", String)
], Images.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Images.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => logs_entity_1.Logs, (log) => log.images, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'log_id' }),
    __metadata("design:type", logs_entity_1.Logs)
], Images.prototype, "log", void 0);
exports.Images = Images = __decorate([
    (0, typeorm_1.Entity)()
], Images);
//# sourceMappingURL=images.entity.js.map