import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Events } from '../entities/events.entity';
import { Users } from '../entities/users.entity';
import { JwtStrategy } from '../auth/jwt.strategy';

// --- Event Module ---
// Module for managing events in the Eagle Eye system
// This follows MCP Context 7 best practices for clean module organization

@Module({
  imports: [
    // Import TypeORM entity for database operations
    TypeOrmModule.forFeature([Events, Users]),
    // Import PassportModule for JWT authentication
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [EventController],
  providers: [EventService, JwtStrategy],
  exports: [EventService], // Export service for use in other modules
})
export class EventModule {}
