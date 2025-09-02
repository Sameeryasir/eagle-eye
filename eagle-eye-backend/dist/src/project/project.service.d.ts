import { Projects } from 'src/entities/projects.entity';
import { Repository } from 'typeorm';
import { Roles } from 'src/entities/roles.entity';
import { CreateProjectDto } from './projectDto/create-project.dto';
import { UpdateProjectDto } from './projectDto/update-project.dto';
import { Companies } from 'src/entities/companies.entity';
import { Users } from 'src/entities/users.entity';
import { Tasks } from 'src/entities/tasks.entity';
interface AuthenticatedUser {
    id: number;
    email: string;
    role: Roles;
}
export declare class ProjectService {
    private projectRepo;
    private companyRepo;
    private userRepo;
    private taskRepo;
    constructor(projectRepo: Repository<Projects>, companyRepo: Repository<Companies>, userRepo: Repository<Users>, taskRepo: Repository<Tasks>);
    private checkAuth;
    getManagerAssignedTasksByProject(projectId: number, authUser: AuthenticatedUser): Promise<(Tasks | {
        overdue: boolean;
        id: number;
        title: string;
        description?: string;
        startTime: Date;
        endTime?: Date;
        priority: import("src/entities/tasks.entity").TaskPriority;
        createdAt: Date;
        project: Projects;
        assignedTo?: Users;
        log: import("../entities/logs.entity").Logs | null;
    })[]>;
    private checkAdmin;
    getProjects(authUser: AuthenticatedUser): Promise<any>;
    getProjectById(id: number, authUser: AuthenticatedUser): Promise<any>;
    createProject(createProjectDto: CreateProjectDto, authUser: AuthenticatedUser): Promise<Projects>;
    updateProject(id: number, updateProjectDto: UpdateProjectDto, authUser: AuthenticatedUser): Promise<Projects>;
    deleteProject(id: number, authUser: AuthenticatedUser): Promise<Projects>;
}
export {};
