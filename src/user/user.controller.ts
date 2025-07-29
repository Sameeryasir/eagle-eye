import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Param,
  BadRequestException,
  Delete,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './userDto/create-user.dto';
import { UpdateUserDto } from './userDto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('all-users')
  @UseGuards(AuthGuard('jwt'))
  async getUsers(@Request() req) {
    const users = await this.userService.getAllUsers(req.user);
    return users;
  }
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getUserById(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findUserById(Number(id), req.user);
    return user;
  }
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @Request() req,
  ) {
    const users = req.user; // Assuming req.user contains the authenticated user info
    console.log(users);
    return this.userService.createUserWithRole(createUserDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteById(@Param('id') id: string, @Request() req) {
    const deletedUser = await this.userService.deleteUserById(
      Number(id),
      req.user,
    );
    return deletedUser;
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateUserById(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const updatedUser = await this.userService.updateUser(
      Number(id),
      updateUserDto,
      req.user,
    );
    return updatedUser;
  }
}
