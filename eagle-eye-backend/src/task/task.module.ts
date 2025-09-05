import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Tasks } from 'src/entities/tasks.entity';
import { Users } from 'src/entities/users.entity';
import { Projects } from 'src/entities/projects.entity';
import { Companies } from 'src/entities/companies.entity';
import { Logs } from 'src/entities/logs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tasks, Users, Projects, Companies, Logs])],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
