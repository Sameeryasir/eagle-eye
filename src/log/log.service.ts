/**
 * Log Service - Handles log operations with one-to-many relationship to tasks
 * 
 * CHANGES MADE:
 * - Fixed linter errors by removing unreachable code referencing 'savedLogs'
 * - Updated all relation references from 'task' to 'tasks' to match entity relationship
 * - Implemented one-to-many relationship: one Log can be associated with multiple Tasks
 * - Added clear section headers and inline comments for better code readability
 * 
 * RELATIONSHIP: Logs (1) -> Tasks (many)
 * DEPENDENCIES: logs.entity.ts, tasks.entity.ts, users.entity.ts
 */
import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logs } from 'src/entities/logs.entity';
import { Tasks } from 'src/entities/tasks.entity';
import { Users } from 'src/entities/users.entity';
import { Roles } from 'src/entities/roles.entity';
import { Repository, In } from 'typeorm';
import { CreateLogDto } from './logDto/create-log.dto';
import { UpdateLogDto } from './logDto/update-log.dto';

interface AuthenticatedUser {
  id: number;
  email: string;
  role: Roles;
}

@Injectable()
export class LogService {
    constructor(
        @InjectRepository(Logs) private logrepo: Repository<Logs>,
        @InjectRepository(Tasks) private taskrepo: Repository<Tasks>,
        @InjectRepository(Users) private userrepo: Repository<Users>
    ){

    }

    private checkAuth(user: AuthenticatedUser) {
      if (!user || !user.id) {
        throw new UnauthorizedException('Login required');
      }
    }
   
    private checkAdmin(user: AuthenticatedUser) {
      this.checkAuth(user);
      if (!user.role || !['Employee', 'Manager'].includes(user.role.name)) {
        throw new UnauthorizedException(
          'you are unauthorized to perform this action',
        );
      }
    }
   
    async createLog(createLogDto: CreateLogDto, authUser: AuthenticatedUser) {
        this.checkAdmin(authUser);
        
        // --- Validation Step ---
        // Check if authenticated user exists in database and has correct role
        const user = await this.userrepo.findOne({ 
            where: { id: authUser.id },
            relations: ['role']
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (!user.role || !['Employee', 'Manager'].includes(user.role.name)) {
            throw new UnauthorizedException('User does not have required role');
        }
        
        // --- Task Validation Step ---
        // Handle multiple task IDs (supports both single task_id and array of task_ids)
        const taskIds = Array.isArray(createLogDto.task_id) ? createLogDto.task_id : [createLogDto.task_id];
        
        // Check if all tasks exist in database
        const tasks = await this.taskrepo.find({ 
            where: { id: In(taskIds) }
        });
        
        if (tasks.length !== taskIds.length) {
            const foundTaskIds = tasks.map(task => task.id);
            const missingTaskIds = taskIds.filter(id => !foundTaskIds.includes(id));
            throw new NotFoundException(`Tasks not found: ${missingTaskIds.join(', ')}`);
        }
        
        // --- Log Creation Step ---
        // Create a single log entry that will be associated with multiple tasks
        // This implements the one-to-many relationship: one Log -> many Tasks
        const log = this.logrepo.create({
            note: createLogDto.note,
            user: user,
            tasks: tasks // Assign all tasks to this single log entry
        });
        
        const savedLog = await this.logrepo.save(log);
        
        return {
            message: `Successfully created log with ${tasks.length} task(s)`,
            log: savedLog
        };
    }

    async getLogs(authUser: AuthenticatedUser) {
        this.checkAdmin(authUser);
        
        // Check if authenticated user exists in database and has correct role
        const user = await this.userrepo.findOne({ 
            where: { id: authUser.id },
            relations: ['role']
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (!user.role || !['Employee', 'Manager'].includes(user.role.name)) {
            throw new UnauthorizedException('User does not have required role');
        }
        
        // Get logs for the specific user with user, tasks, and images relations
        const logs = await this.logrepo.find({
            where: { user: { id: user.id } },
            relations: ['user', 'tasks', 'images'],
            order: { createdAt: 'DESC' }
        });
        
        return logs;
    }

    async updateLog(logId: number, updateLogDto: UpdateLogDto, authUser: AuthenticatedUser) {
        this.checkAdmin(authUser);
        
        // Check if authenticated user exists in database and has correct role
        const user = await this.userrepo.findOne({ 
            where: { id: authUser.id },
            relations: ['role']
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (!user.role || !['Employee', 'Manager'].includes(user.role.name)) {
            throw new UnauthorizedException('User does not have required role');
        }
        
        // Check if log exists
        const log = await this.logrepo.findOne({ 
            where: { id: logId },
            relations: ['user', 'tasks']
        });
        if (!log) {
            throw new NotFoundException('Log not found');
        }
        
        // Update the existing log with new data from DTO
        if (updateLogDto.Note !== undefined) {
            log.note = updateLogDto.Note;
        }
        
        return await this.logrepo.save(log);
    }

    async deleteLog(logId: number, authUser: AuthenticatedUser) {
        this.checkAdmin(authUser);
        
        // Check if authenticated user exists in database and has correct role
        const user = await this.userrepo.findOne({ 
            where: { id: authUser.id },
            relations: ['role']
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (!user.role || !['Employee', 'Manager'].includes(user.role.name)) {
            throw new UnauthorizedException('User does not have required role');
        }
        
        // Check if log exists
        const log = await this.logrepo.findOne({ 
            where: { id: logId },
            relations: ['user', 'tasks']
        });
        if (!log) {
            throw new NotFoundException('Log not found');
        }
        
        // Delete the log
        await this.logrepo.remove(log);
        return log;
    }
}
