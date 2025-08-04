import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Otps } from 'src/entities/otps.entity';
import { Roles } from 'src/entities/roles.entity';
import { PassportModule } from '@nestjs/passport';
import { Companies } from 'src/entities/companies.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Users, Otps, Roles, Companies]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
