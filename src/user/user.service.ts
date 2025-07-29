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
  ) {}

  private checkAuth(user: AuthenticatedUser) {
    if (!user || !user.id) {
      throw new UnauthorizedException('Login required');
    }
  }

  private checkAdmin(user: AuthenticatedUser) {
    this.checkAuth(user);
    if (!user.role || user.role.name !== 'Admin') {
      throw new UnauthorizedException('Only admin allowed');
    }
  }

  async getAllUsers(authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);
    return this.userRepo.find({ relations: ['role'] });
  }

  async findUserById(id: number, authUser: AuthenticatedUser) {
    this.checkAuth(authUser);



    const user = await this.userRepo.findOne({ where: { id }, relations: ['role'] });
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  async createUserWithRole(dto: CreateUserDto, authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);

    const { email, phone, first_name, last_name, roleId } = dto;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new BadRequestException('Role not found');

    const user = this.userRepo.create({ email, phone, first_name, last_name, role });

    try {
      const saved = await this.userRepo.save(user);
      return this.userRepo.findOne({ where: { id: saved.id }, relations: ['role'] }) as Promise<Users>;
    } catch (err) {
      if (err.code === '23505') {
        throw new BadRequestException('Email or phone already exists');
      }
      throw err;
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

  async updateUser(id: number, dto: UpdateUserDto, authUser: AuthenticatedUser) {
    this.checkAdmin(authUser);

    const user = await this.userRepo.findOne({ where: { id }, relations: ['role'] });
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
}
