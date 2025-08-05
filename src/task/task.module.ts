import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Tasks } from 'src/entities/tasks.entity';
import { Users } from 'src/entities/users.entity';
import { Projects } from 'src/entities/projects.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tasks, Users, Projects])],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
