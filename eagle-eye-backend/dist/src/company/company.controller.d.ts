import { CompanyService } from './company.service';
import { CreateCompanyDto } from './companyDto/create-company.dto';
import { UpdateCompanyDto } from './companyDto/update-company.dto';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    getCompany(req: any): Promise<{
        totalEmployees: number;
        id: number;
        name: string;
        address: string;
        city: string;
        state: string;
        country: string;
        owner: import("../entities/users.entity").Users;
        projects: import("../entities/projects.entity").Projects[];
    }[]>;
    createCompany(companydto: CreateCompanyDto, req: any): Promise<import("../entities/companies.entity").Companies>;
    updateCompany(id: string, companyDto: UpdateCompanyDto, req: any): Promise<import("../entities/companies.entity").Companies>;
    deleteCompany(id: string, req: any): Promise<import("../entities/companies.entity").Companies>;
}
