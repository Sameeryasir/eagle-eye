import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Otps } from 'src/entities/otps.entity';
import { Roles } from 'src/entities/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Otps, Roles])],

  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
