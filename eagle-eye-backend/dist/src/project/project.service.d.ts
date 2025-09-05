import { Projects } from 'src/entities/projects.entity';
import { Repository } from 'typeorm';
import { Logs } from 'src/entities/logs.entity';
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
    private logRepo;
    constructor(projectRepo: Repository<Projects>, companyRepo: Repository<Companies>, userRepo: Repository<Users>, taskRepo: Repository<Tasks>, logRepo: Repository<Logs>);
    private checkAuth;
    getManagerAssignedTasksByProject(projectId: number, authUser: AuthenticatedUser): Promise<Tasks[]>;
    private checkAdmin;
    getProjects(authUser: AuthenticatedUser): Promise<any>;
    getProjectsforLogsSearching(authUser: AuthenticatedUser): Promise<any>;
    getProjectById(id: number, authUser: AuthenticatedUser): Promise<any>;
    createProject(createProjectDto: CreateProjectDto, authUser: AuthenticatedUser): Promise<Projects>;
    updateProject(id: number, updateProjectDto: UpdateProjectDto, authUser: AuthenticatedUser): Promise<Projects>;
    deleteProject(id: number, authUser: AuthenticatedUser): Promise<Projects>;
}
export {};
