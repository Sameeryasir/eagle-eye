import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { expoTokens } from '../entities/expoTokens.entity';
import { Users } from '../entities/users.entity';
import { Tasks } from '../entities/tasks.entity';
import { JwtStrategy } from '../auth/jwt.strategy';

// --- Notification Module ---
// Module for managing expo push tokens and notifications
// This follows MCP Context 7 best practices for clean module organization

@Module({
  imports: [
    // Import TypeORM entities for database operations
    TypeOrmModule.forFeature([expoTokens, Users, Tasks]),
    // Import PassportModule for JWT authentication
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, JwtStrategy],
  exports: [NotificationService], // Export service for use in other modules
})
export class NotificationModule {}