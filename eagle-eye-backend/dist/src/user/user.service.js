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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_entity_1 = require("../entities/users.entity");
const roles_entity_1 = require("../entities/roles.entity");
const axios_1 = require("axios");
const companies_entity_1 = require("../entities/companies.entity");
let UserService = class UserService {
    userRepo;
    roleRepo;
    companyRepo;
    constructor(userRepo, roleRepo, companyRepo) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.companyRepo = companyRepo;
    }
    checkAuth(user) {
        if (!user || !user.id) {
            throw new common_1.UnauthorizedException('Login required');
        }
    }
    checkAdmin(user) {
        this.checkAuth(user);
        if (!user.role || !['Admin', 'Owner', 'Manager'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('you are unauthorized to perform this action');
        }
    }
    async getAllUsers(authUser) {
        this.checkAdmin(authUser);
        return this.userRepo.find({ relations: ['role'] });
    }
    async findUserById(id, authUser) {
        this.checkAuth(authUser);
        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['role'],
        });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        return user;
    }
    async createUserWithRole(dto, authUser) {
        this.checkAdmin(authUser);
        const { email, phone, first_name, last_name, roleId, company } = dto;
        if (!first_name || !last_name) {
            throw new common_1.BadRequestException('First name and last name are required');
        }
        if (!email && !phone) {
            throw new common_1.BadRequestException('Email or phone is required');
        }
        const role = await this.roleRepo.findOne({ where: { id: roleId } });
        if (!role) {
            throw new common_1.BadRequestException('Role not found');
        }
        const createdBy = await this.userRepo.findOne({ where: { id: authUser.id } });
        if (!createdBy) {
            throw new common_1.UnauthorizedException('Creator not found');
        }
        let userCompany = null;
        if (company) {
            userCompany = await this.companyRepo.findOne({
                where: { id: company },
                relations: ['owner'],
            });
            if (!userCompany) {
                throw new common_1.BadRequestException('Company not found');
            }
            if (role.name === 'Owner') {
                if (userCompany.owner) {
                    throw new common_1.BadRequestException('This company already has an owner');
                }
            }
            if (authUser.role.name === 'Admin' && role.name === 'Owner') {
                const existingOwner = await this.userRepo.findOne({
                    where: {
                        company: { id: company },
                        role: { name: 'Owner' }
                    }
                });
                if (existingOwner) {
                    throw new common_1.BadRequestException('Admin cannot create an Owner role user when an owner already exists for this company');
                }
            }
            if (role.name === 'Admin' || role.name === 'Owner') {
                const existingUserWithRole = await this.userRepo.findOne({
                    where: {
                        company: { id: company },
                        role: { name: role.name }
                    }
                });
                if (existingUserWithRole) {
                    throw new common_1.BadRequestException(`A user with role '${role.name}' already exists in this company`);
                }
            }
            if (role.name === 'Employee') {
                const companyOwner = await this.userRepo.findOne({
                    where: {
                        company: { id: company },
                        role: { name: 'Owner' }
                    }
                });
                if (!companyOwner || companyOwner.id !== authUser.id) {
                    throw new common_1.BadRequestException('You can only create employees in companies where you are the owner');
                }
            }
        }
        const newUser = this.userRepo.create({
            email,
            phone,
            first_name,
            last_name,
            role,
            createdBy,
            company: userCompany || undefined,
        });
        try {
            const savedUser = await this.userRepo.save(newUser);
            if (role.name === 'Owner' && userCompany) {
                userCompany.owner = savedUser;
                await this.companyRepo.save(userCompany);
            }
            return this.userRepo.findOne({
                where: { id: savedUser.id },
                relations: ['role', 'createdBy', 'createdBy.role', 'company'],
            });
        }
        catch (err) {
            if (err.code === '23505') {
                throw new common_1.BadRequestException('Email or phone already exists');
            }
            throw new common_1.BadRequestException('Error creating user: ' + err.message);
        }
    }
    async deleteUserById(id, authUser) {
        this.checkAdmin(authUser);
        if (authUser.id === id) {
            throw new common_1.BadRequestException('Admin cannot delete themselves');
        }
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        await this.userRepo.remove(user);
        return user;
    }
    async updateUser(id, dto, authUser) {
        this.checkAdmin(authUser);
        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['role', 'company'],
        });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (dto.roleId) {
            const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
            if (!role)
                throw new common_1.BadRequestException('Role not found');
            if (role.name === 'Owner' && user.company) {
                const company = await this.companyRepo.findOne({
                    where: { id: user.company.id },
                    relations: ['owner'],
                });
                if (company && company.owner && company.owner.id !== user.id) {
                    throw new common_1.BadRequestException('This company already has an owner');
                }
            }
            user.role = role;
        }
        user.email = dto.email ?? user.email;
        user.first_name = dto.first_name ?? user.first_name;
        user.last_name = dto.last_name ?? user.last_name;
        user.phone = dto.phone ?? user.phone;
        try {
            const savedUser = await this.userRepo.save(user);
            if (dto.roleId && user.role.name === 'Owner' && user.company) {
                user.company.owner = savedUser;
                await this.companyRepo.save(user.company);
            }
            return savedUser;
        }
        catch (err) {
            if (err.code === '23505') {
                throw new common_1.BadRequestException('Email or phone already exists');
            }
            throw err;
        }
    }
    async sendPushNotification(token, title, message) {
        if (!token || !token.startsWith('ExponentPushToken')) {
            throw new Error('Invalid Expo push token');
        }
        const payload = {
            to: token,
            sound: 'default',
            title: title,
            body: message,
        };
        try {
            const response = await axios_1.default.post('https://exp.host/--/api/v2/push/send', payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __param(1, (0, typeorm_1.InjectRepository)(roles_entity_1.Roles)),
    __param(2, (0, typeorm_1.InjectRepository)(companies_entity_1.Companies)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map