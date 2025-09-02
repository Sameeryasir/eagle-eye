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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const companies_entity_1 = require("../entities/companies.entity");
const typeorm_2 = require("typeorm");
const users_entity_1 = require("../entities/users.entity");
let CompanyService = class CompanyService {
    companyRepo;
    userRepo;
    constructor(companyRepo, userRepo) {
        this.companyRepo = companyRepo;
        this.userRepo = userRepo;
    }
    checkAuth(user) {
        console.log(user);
        if (!user || !user.id) {
            throw new common_1.UnauthorizedException('Login required');
        }
    }
    checkAdmin(user) {
        this.checkAuth(user);
        if (!user.role || !['Admin', 'Owner'].includes(user.role.name)) {
            throw new common_1.UnauthorizedException('you are unauthorized to perform this action');
        }
    }
    async getCompany(authUser) {
        if (!authUser || !authUser.role || authUser.role.name !== 'Admin') {
            throw new common_1.UnauthorizedException('Only Admin can access this API');
        }
        const companies = await this.companyRepo.find({
            relations: ['owner'],
        });
        const companiesWithEmployeeCount = await Promise.all(companies.map(async (company) => {
            const employeeCount = await this.userRepo.count({
                where: {
                    company: { id: company.id },
                    role: { name: 'Employee' },
                },
            });
            return {
                ...company,
                totalEmployees: employeeCount,
            };
        }));
        return companiesWithEmployeeCount;
    }
    async createCompany(companydto, authUser) {
        this.checkAdmin(authUser);
        const { name, address, city, state, ownerId } = companydto;
        let owner = null;
        if (ownerId) {
            owner = await this.userRepo.findOne({
                where: { id: ownerId },
                relations: ['role'],
            });
            if (!owner) {
                throw new common_1.UnauthorizedException('Owner not found');
            }
            if (owner.role?.name !== 'Owner') {
                throw new common_1.BadRequestException('Selected user is not an Owner');
            }
            const alreadyAssigned = await this.companyRepo.findOne({
                where: { owner: { id: ownerId } },
            });
            if (alreadyAssigned) {
                throw new common_1.BadRequestException(`User ID ${ownerId} is already an owner of another company (ID: ${alreadyAssigned.id})`);
            }
        }
        const company = this.companyRepo.create({
            name,
            address,
            city,
            state,
            ...(owner && { owner }),
        });
        return await this.companyRepo.save(company);
    }
    async updateCompany(companydto, authUser, id) {
        await this.checkAdmin(authUser);
        const company = await this.companyRepo.findOne({
            where: { id },
        });
        if (!company) {
            throw new common_1.BadRequestException('Company not found');
        }
        if (companydto.name !== undefined)
            company.name = companydto.name;
        if (companydto.address !== undefined)
            company.address = companydto.address;
        if (companydto.city !== undefined)
            company.city = companydto.city;
        if (companydto.state !== undefined)
            company.state = companydto.state;
        if (companydto.country !== undefined)
            company.country = companydto.country;
        return this.companyRepo.save(company);
    }
    async deleteCompany(id, authUser) {
        this.checkAdmin(authUser);
        const company = await this.companyRepo.findOne({
            where: {
                id: id,
            },
        });
        if (!company) {
            throw new common_1.NotFoundException('company not found ');
        }
        await this.companyRepo.remove(company);
        return company;
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(companies_entity_1.Companies)),
    __param(1, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CompanyService);
//# sourceMappingURL=company.service.js.map