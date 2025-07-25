import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from 'src/entities/roles.entity';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './userDto/create-user.dto';
import { UpdateUserDto } from './userDto/update-user.dto';
import { JwtService } from '@nestjs/jwt';

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
    private jwtService: JwtService,
  ) {}
  async getAllUsers(authenticatedUser: AuthenticatedUser) {
    // Check if authenticated user exists and has admin role
    if (!authenticatedUser || !authenticatedUser.id) {
      throw new UnauthorizedException('Authentication required');
    }

    // Check if the authenticated user has admin role
    if (!authenticatedUser.role || authenticatedUser.role.name !== 'Admin') {
      throw new UnauthorizedException('Only admin users can view all users');
    }

    const users = await this.userRepo.find({
      relations: ['role'],
    });
    return users;
  }
  async findUserById(id: number, authenticatedUser: AuthenticatedUser) {
    // Check if authenticated user exists
    if (!authenticatedUser || !authenticatedUser.id) {
      throw new UnauthorizedException('Authentication required');
    }

    // Users can view their own profile or admin can view any profile
    if (authenticatedUser.id !== id && 
        (!authenticatedUser.role || authenticatedUser.role.name !== 'Admin')) {
      throw new UnauthorizedException('You can only view your own profile');
    }

    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }

    return user;
  }
async createUserWithRole(
  dto: CreateUserDto,
  authenticatedUser: AuthenticatedUser,
): Promise<Users> {
  // Check if authenticated user exists and has admin role
  if (!authenticatedUser || !authenticatedUser.id) {
    throw new UnauthorizedException('Authentication required');
  }

  // Check if the authenticated user has admin role
  if (!authenticatedUser.role || authenticatedUser.role.name !== 'Admin') {
    throw new UnauthorizedException('Only admin users can create new users');
  }

  const { email, first_name, last_name, phone, roleId } = dto;

  if (!email && !phone) {
    throw new BadRequestException('Either email or phone must be provided');
  }

  const role = await this.roleRepo.findOne({ where: { id: roleId } });
  if (!role) {
    throw new BadRequestException('Role not found');
  }

  const user = this.userRepo.create({
    email,
    first_name,
    last_name,
    phone,
    role,
  });

  try {
    const savedUser = await this.userRepo.save(user);

    // Fetch the saved user with relations (role)
    const userWithRelations = await this.userRepo.findOne({
      where: { id: savedUser.id },
      relations: ['role'],
    });

    return userWithRelations!;
  } catch (err) {
    if (err.code === '23505') {
      throw new BadRequestException('Email or phone already exists');
    }
    throw err;
  }
}

     async deleteUserById(id: number, authenticatedUser: AuthenticatedUser) {
     // Check if authenticated user exists and has admin role
     if (!authenticatedUser || !authenticatedUser.id) {
       throw new UnauthorizedException('Authentication required');
     }

     // Check if the authenticated user has admin role
     if (!authenticatedUser.role || authenticatedUser.role.name !== 'Admin') {
       throw new UnauthorizedException('Only admin users can delete users');
     }

     // Check if admin is trying to delete themselves
     if (authenticatedUser.id === id) {
       throw new BadRequestException('Admin cannot delete their own account');
     }

     const deletedUser = await this.userRepo.findOne({
       where: {
         id: id,
       },
     });
     if (!deletedUser) {
       throw new BadRequestException(`User with ID ${id} not found`);
     }
     await this.userRepo.remove(deletedUser);
     return deletedUser;
   }

  async updateUser(
    id: number,
    dto: UpdateUserDto,
    authenticatedUser: AuthenticatedUser,
  ) {
    // Check if authenticated user exists and has admin role
    if (!authenticatedUser || !authenticatedUser.id) {
      throw new UnauthorizedException('Authentication required');
    }

    // Check if the authenticated user has admin role
    if (!authenticatedUser.role || authenticatedUser.role.name !== 'Admin') {
      throw new UnauthorizedException('Only admin users can update users');
    }

    // Find the user to update
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }

         // If roleId is provided, validate and update the role
     if (dto.roleId) {
       const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
       if (!role) {
         throw new BadRequestException('Role not found');
       }
       user.role = role;
     }

     // Additional validation for email format
     if (dto.email !== undefined) {
       if (dto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
         throw new BadRequestException('Invalid email format');
       }
       user.email = dto.email;
     }

     // Additional validation for first_name
     if (dto.first_name !== undefined) {
       if (dto.first_name && !/^[a-zA-Z\s]{2,50}$/.test(dto.first_name)) {
         throw new BadRequestException('First name must contain only letters and spaces, 2-50 characters');
       }
       user.first_name = dto.first_name;
     }

     // Additional validation for last_name
     if (dto.last_name !== undefined) {
       if (dto.last_name && !/^[a-zA-Z\s]{2,50}$/.test(dto.last_name)) {
         throw new BadRequestException('Last name must contain only letters and spaces, 2-50 characters');
       }
       user.last_name = dto.last_name;
     }

     // Additional validation for phone
     if (dto.phone !== undefined) {
       if (dto.phone && !/^\d{10}$/.test(dto.phone)) {
         throw new BadRequestException('Phone number must be exactly 10 digits');
       }
       user.phone = dto.phone;
     }

    try {
      const updatedUser = await this.userRepo.save(user);
      return updatedUser;
    } catch (err) {
      if (err.code === '23505') {
        throw new BadRequestException('Email or phone already exists');
      }
      throw err;
    }
  }
}
