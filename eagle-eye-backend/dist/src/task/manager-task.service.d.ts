import { Repository } from 'typeorm';
import { Tasks } from 'src/entities/tasks.entity';
import { Users } from 'src/entities/users.entity';
import { Projects } from 'src/entities/projects.entity';
import { Companies } from 'src/entities/companies.entity';
import { Roles } from 'src/entities/roles.entity';
interface AuthenticatedUser {
    id: number;
    email: string;
    role: Roles;
}
export declare class ManagerTaskService {
    private taskRepo;
    private userRepo;
    private projectRepo;
    private companyRepo;
    constructor(taskRepo: Repository<Tasks>, userRepo: Repository<Users>, projectRepo: Repository<Projects>, companyRepo: Repository<Companies>);
    private checkAuth;
    private checkManager;
    getProjectTasksAssignedToEmployees(projectId: number, authUser: AuthenticatedUser): Promise<Tasks[]>;
}
export {};
