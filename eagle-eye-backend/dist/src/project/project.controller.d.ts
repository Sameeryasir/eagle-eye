import { ProjectService } from './project.service';
import { CreateProjectDto } from './projectDto/create-project.dto';
import { UpdateProjectDto } from './projectDto/update-project.dto';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    getProjects(req: any): Promise<any>;
    getProjectById(id: string, req: any): Promise<any>;
    getManagerAssignedTasksByProject(id: string, req: any): Promise<(import("../entities/tasks.entity").Tasks | {
        overdue: boolean;
        id: number;
        title: string;
        description?: string;
        startTime: Date;
        endTime?: Date;
        priority: import("../entities/tasks.entity").TaskPriority;
        createdAt: Date;
        project: import("../entities/projects.entity").Projects;
        assignedTo?: import("../entities/users.entity").Users;
        log: import("../entities/logs.entity").Logs | null;
    })[]>;
    createProject(createProjecDto: CreateProjectDto, req: any): Promise<import("../entities/projects.entity").Projects>;
    updateProject(id: string, updateProjectDto: UpdateProjectDto, req: any): Promise<import("../entities/projects.entity").Projects>;
    deleteProject(id: string, req: any): Promise<import("../entities/projects.entity").Projects>;
}
