import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Projects } from 'src/entities/projects.entity';
import { Companies } from 'src/entities/companies.entity';
import { Users } from 'src/entities/users.entity';
import { Tasks } from 'src/entities/tasks.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Projects, Companies, Users, Tasks])
  ],
  providers: [ProjectService],
  controllers: [ProjectController]
})
export class ProjectModule {}
