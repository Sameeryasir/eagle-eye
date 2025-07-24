import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from 'src/entities/roles.entity';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './userDto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private userRepo: Repository<Users>,
    @InjectRepository(Roles) private roleRepo: Repository<Roles>,
  ) {}

  async createUserWithRole(dto: CreateUserDto): Promise<Users> {
    const { email, first_name, last_name, phone, roleId } = dto;

    // ✅ Require either email or phone
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    // ✅ Check if the role exists
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    // ✅ Note: Removed OneToOne restriction check since relationship is now ManyToOne
    // Multiple users can now have the same role

    // ✅ Create and save user
    const user = this.userRepo.create({
      email,
      first_name,
      last_name,
      phone,
      role,
    });

    try {
      return await this.userRepo.save(user);
    } catch (err) {
      // Handle unique constraint violations (PostgreSQL error code 23505)
      if (err.code === '23505') {
        throw new BadRequestException('Email or phone already exists');
      }
      throw err;
    }
  }
}
