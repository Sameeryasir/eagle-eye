import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'src/entities/users.entity';
import { Roles } from 'src/entities/roles.entity';
import { CreateUserDto } from './userDto/create-user.dto';
import { UpdateUserDto } from './userDto/update-user.dto';
import axios from 'axios';
import { Companies } from 'src/entities/companies.entity';
interface AuthenticatedUser {
  id: number;
  email: string;
  role: Roles;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private userRepo: Repository<Users>,
    @InjectRepository(Roles) private roleRepo: Repository<Roles>,
    @InjectRepository(Companies) private companyRepo: Repository<Companies>,
  ) {}

  private checkAuth(user: AuthenticatedUser) {
    if (!user || !user.id) {
      throw new UnauthorizedException('Login required');
    }
  }

  private checkAdmin(user: AuthenticatedUser) {
    this.checkAuth(user);
    if (!user.role || !['Admin', 'Owner', 'Manager'].includes(user.role.name)) {
      throw new UnauthorizedException(
        'you are unauthorized to perform this action',
      );
    }
  }

  async getAllUsers(authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);
    return this.userRepo.find({ relations: ['role'] });
  }

  async findUserById(id: number, authUser: AuthenticatedUser) {
    this.checkAuth(authUser);

    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

async createUserWithRole(dto: CreateUserDto, authUser: AuthenticatedUser) {
  this.checkAdmin(authUser);

  const { email, phone, first_name, last_name, roleId, company } = dto;

  // Basic validation
  if (!first_name || !last_name) {
    throw new BadRequestException('First name and last name are required');
  }

  if (!email && !phone) {
    throw new BadRequestException('Email or phone is required');
  }

  // Check if role exists
  const role = await this.roleRepo.findOne({ where: { id: roleId } });
  if (!role) {
    throw new BadRequestException('Role not found');
  }

  // Get the creator user
  const createdBy = await this.userRepo.findOne({ where: { id: authUser.id } });
  if (!createdBy) {
    throw new UnauthorizedException('Creator not found');
  }

  let userCompany: Companies | null = null;

  if (company) {
    userCompany = await this.companyRepo.findOne({
      where: { id: company },
      relations: ['owner'],
    });

    if (!userCompany) {
      throw new BadRequestException('Company not found');
    }

    // 🚫 Only one owner per company
    if (role.name === 'Owner') {
      if (userCompany.owner) {
        throw new BadRequestException('This company already has an owner');
      }
    }
  }

  // Create user
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

    // ✅ Assign owner to the company if role is Owner
    if (role.name === 'Owner' && userCompany) {
      userCompany.owner = savedUser;
      await this.companyRepo.save(userCompany);
    }

    return this.userRepo.findOne({
      where: { id: savedUser.id },
      relations: ['role', 'createdBy', 'createdBy.role', 'company'],
    });
  } catch (err) {
    if (err.code === '23505') {
      throw new BadRequestException('Email or phone already exists');
    }
    throw new BadRequestException('Error creating user: ' + err.message);
  }
}


  

  async deleteUserById(id: number, authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);

    if (authUser.id === id) {
      throw new BadRequestException('Admin cannot delete themselves');
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new BadRequestException('User not found');

    await this.userRepo.remove(user);
    return user;
  }

  async updateUser(
    id: number,
    dto: UpdateUserDto,
    authUser: AuthenticatedUser,
  ) {
    this.checkAdmin(authUser);

    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) throw new BadRequestException('User not found');

    if (dto.roleId) {
      const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
      if (!role) throw new BadRequestException('Role not found');
      user.role = role;
    }

    user.email = dto.email ?? user.email;
    user.first_name = dto.first_name ?? user.first_name;
    user.last_name = dto.last_name ?? user.last_name;
    user.phone = dto.phone ?? user.phone;

    try {
      return await this.userRepo.save(user);
    } catch (err) {
      if (err.code === '23505') {
        throw new BadRequestException('Email or phone already exists');
      }
      throw err;
    }
  }
  async sendPushNotification(token: string, title: string, message: string) {
    // Validate Expo push token
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
      const response = await axios.post(
        'https://exp.host/--/api/v2/push/send',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
