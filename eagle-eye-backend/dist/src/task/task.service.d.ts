import { Tasks } from 'src/entities/tasks.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './taskDto/create-task.dto';
import { Roles } from 'src/entities/roles.entity';
import { Users } from 'src/entities/users.entity';
import { Projects } from 'src/entities/projects.entity';
import { UpdateTaskDto } from './taskDto/update-task.dto';
import { Companies } from 'src/entities/companies.entity';
import { TaskFilterDto } from './taskDto/task-filter.dto';
interface AuthenticatedUser {
    id: number;
    email: string;
    role: Roles;
}
export declare class TaskService {
    private taskRepo;
    private userRepo;
    private projectRepo;
    private companyRepo;
    constructor(taskRepo: Repository<Tasks>, userRepo: Repository<Users>, projectRepo: Repository<Projects>, companyRepo: Repository<Companies>);
    private checkAuth;
    private checkAdmin;
    private checkManagerAndEmployee;
    getTaskByProjectId(projectId: number, authUser: AuthenticatedUser): Promise<Tasks[]>;
    getTask(authUser: AuthenticatedUser): Promise<Tasks[]>;
    getTodaysTask(authUser: AuthenticatedUser): Promise<Tasks[]>;
    getEmployeesToAssingeTask(authUser: AuthenticatedUser): Promise<any>;
    createTask(CreateTaskDto: CreateTaskDto, authUser: AuthenticatedUser): Promise<Tasks>;
    updateTaskById(updateTaskDto: UpdateTaskDto, authUser: AuthenticatedUser, id: number): Promise<Tasks>;
    deleteTask(id: number, authUser: AuthenticatedUser): Promise<Tasks>;
    assignTaskToUser(taskId: number, assignedToUserId: number, authUser: AuthenticatedUser): Promise<Tasks>;
    getTaskById(id: number, authUser: AuthenticatedUser): Promise<Tasks>;
    filterTasks(filter: TaskFilterDto, authUser: AuthenticatedUser): Promise<Tasks[]>;
}
export {};
