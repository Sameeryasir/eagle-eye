import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Companies) private companyRepo: Repository<Companies>,
    @InjectRepository(Users) private userRepo: Repository<Users>,
  ) {}
  private checkAuth(user: AuthenticatedUser) {
    console.log(user);

    if (!user || !user.id) {
      throw new UnauthorizedException('Login required');
    }
  }
  private checkAdmin(user: AuthenticatedUser) {
    this.checkAuth(user);
    if (!user.role || !['Admin', 'Owner'].includes(user.role.name)) {
      throw new UnauthorizedException(
        'you are unauthorized to perform this action',
      );
    }
  }
  async getCompany(authUser: AuthenticatedUser) {
    this.checkAdmin(authUser); // Ensure user is Admin/Owner/Manager

    const company = await this.companyRepo.findOne({
      where: {
        owner: { id: authUser.id },
      },
    });

    if (!company) {
      throw new UnauthorizedException('No company found for this user');
    }

    return company;
  }

async createCompany(
  companydto: CreateCompanyDto,
  authUser: AuthenticatedUser,
) {
  this.checkAdmin(authUser);

  const { name, address, city, state, ownerId } = companydto;

  let owner: Users | null = null;

  if (ownerId) {
    // Fetch owner with role relation
    owner = await this.userRepo.findOne({
      where: { id: ownerId },
      relations: ['role'],
    });

    if (!owner) {
      throw new UnauthorizedException('Owner not found');
    }

    if (owner.role?.name !== 'Owner') {
      throw new BadRequestException('Selected user is not an Owner');
    }

    // Make sure this user is not already an owner of another company
    const alreadyAssigned = await this.companyRepo.findOne({
      where: { owner: { id: ownerId } },
    });

    if (alreadyAssigned) {
      throw new BadRequestException(
        `User ID ${ownerId} is already an owner of another company (ID: ${alreadyAssigned.id})`,
      );
    }
  }

  // Create and save the company
  const company = this.companyRepo.create({
    name,
    address,
    city,
    state,
    ...(owner && { owner }), // Only include owner if it's not null
  });

  return await this.companyRepo.save(company);
}



  async updateCompany(
    companydto: UpdateCompanyDto,
    authUser: AuthenticatedUser,
    id: number,
  ) {
    await this.checkAdmin(authUser);

    const company = await this.companyRepo.findOne({
      where: { id },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    if (companydto.name !== undefined) company.name = companydto.name;
    if (companydto.address !== undefined) company.address = companydto.address;
    if (companydto.city !== undefined) company.city = companydto.city;
    if (companydto.state !== undefined) company.state = companydto.state;
    if (companydto.country !== undefined) company.country = companydto.country;

    return this.companyRepo.save(company);
  }
  async deleteCompany(id: number, authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);
    const company = await this.companyRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!company) {
      throw new NotFoundException('company not found ');
    }
    await this.companyRepo.remove(company);
    return company;
  }
}
