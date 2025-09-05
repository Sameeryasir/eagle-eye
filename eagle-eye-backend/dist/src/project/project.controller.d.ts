import { ProjectService } from './project.service';
import { CreateProjectDto } from './projectDto/create-project.dto';
import { UpdateProjectDto } from './projectDto/update-project.dto';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    getProjects(req: any): Promise<any>;
    getProjectsforLogsSearching(req: any): Promise<any>;
    getProjectById(id: string, req: any): Promise<any>;
    getManagerAssignedTasksByProject(id: string, req: any): Promise<import("../entities/tasks.entity").Tasks[]>;
    createProject(createProjecDto: CreateProjectDto, req: any): Promise<import("../entities/projects.entity").Projects>;
    updateProject(id: string, updateProjectDto: UpdateProjectDto, req: any): Promise<import("../entities/projects.entity").Projects>;
    deleteProject(id: string, req: any): Promise<import("../entities/projects.entity").Projects>;
}
