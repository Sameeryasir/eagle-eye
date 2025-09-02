import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Otps } from 'src/entities/otps.entity';
import { Roles } from 'src/entities/roles.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../auth/jwt.strategy';
import { Companies } from 'src/entities/companies.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Users, Otps, Roles,Companies]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwtSecret = config.get<string>('JWT_SECRET');
        if (!jwtSecret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: config.get<string>('JWT_EXPIRES') || '1h',
          },
        };
      },
    }),
  ],

  providers: [UserService, JwtStrategy],
  controllers: [UserController],
})
export class UserModule {}
