import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  Request,
  UseGuards,
  Get,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './projectDto/create-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProjectDto } from './projectDto/update-project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getProjects(@Request() req) {
    const user = req.user;
    const projects = await this.projectService.getProjects(user);
    return projects;
  }
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getProjectById(@Param('id') id: string ,@Request() req) {
    const user= req.user;
    const project = await this.projectService.getProjectById(Number(id),user);
    return project;
  }
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createProject(
    @Body(ValidationPipe) createProjecDto: CreateProjectDto,
    @Request() req,
  ) {
    const user = req.user;
    const project = await this.projectService.createProject(
      createProjecDto,
      user,
    );
    return project;
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateProject(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    const user = req.user;
    const project = await this.projectService.updateProject(
      Number(id),
      updateProjectDto,
      user,
    );
    return project;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteProject(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const project = await this.projectService.deleteProject(Number(id), user);
    return project;
  }
}
