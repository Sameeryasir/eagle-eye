import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logs } from 'src/entities/logs.entity';
import { Tasks } from 'src/entities/tasks.entity';
import { Users } from 'src/entities/users.entity';
import { Roles } from 'src/entities/roles.entity';
import { Repository } from 'typeorm';
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
        
        // Check if task exists
        const task = await this.taskrepo.findOne({ where: { id: createLogDto.task_id } });
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        
        // Check if log already exists for this task (unique constraint)
        const existingLog = await this.logrepo.findOne({ 
            where: { task: { id: createLogDto.task_id } }
        });
        if (existingLog) {
            throw new BadRequestException('A log already exists for this task');
        }
        
        // Create log with user and task entities
        const logData = {
            note: createLogDto.note,
            user: user,
            task: task
        };
        
        const log = this.logrepo.create(logData);
        return await this.logrepo.save(log);
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
        
        // Get logs for the specific user with user and task relations
        const logs = await this.logrepo.find({
            where: { user: { id: user.id } },
            relations: ['user', 'task'],
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
            relations: ['user', 'task']
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
            relations: ['user', 'task']
        });
        if (!log) {
            throw new NotFoundException('Log not found');
        }
        
        // Delete the log
        await this.logrepo.remove(log);
        return log;
    }
}
