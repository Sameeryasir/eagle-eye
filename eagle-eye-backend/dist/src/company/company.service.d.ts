import { Companies } from 'src/entities/companies.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './companyDto/create-company.dto';
import { Roles } from 'src/entities/roles.entity';
import { Users } from 'src/entities/users.entity';
import { UpdateCompanyDto } from './companyDto/update-company.dto';
interface AuthenticatedUser {
    id: number;
    email: string;
    role: Roles;
}
export declare class CompanyService {
    private companyRepo;
    private userRepo;
    constructor(companyRepo: Repository<Companies>, userRepo: Repository<Users>);
    private checkAuth;
    private checkAdmin;
    getCompany(authUser: AuthenticatedUser): Promise<{
        totalEmployees: number;
        id: number;
        name: string;
        address: string;
        city: string;
        state: string;
        country: string;
        owner: Users;
        projects: import("../entities/projects.entity").Projects[];
    }[]>;
    createCompany(companydto: CreateCompanyDto, authUser: AuthenticatedUser): Promise<Companies>;
    updateCompany(companydto: UpdateCompanyDto, authUser: AuthenticatedUser, id: number): Promise<Companies>;
    deleteCompany(id: number, authUser: AuthenticatedUser): Promise<Companies>;
}
export {};
