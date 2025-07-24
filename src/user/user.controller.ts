import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './userDto/create-user.dto';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUserWithRole(createUserDto);
  }
}
