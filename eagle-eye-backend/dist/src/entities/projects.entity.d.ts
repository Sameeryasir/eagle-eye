import { Users } from './users.entity';
import { Companies } from './companies.entity';
import { Tasks } from './tasks.entity';
export declare class Projects {
    id: number;
    name: string;
    description: string;
    startDate: Date;
    owner: Users;
    company: Companies;
    assignedTo: Users;
    tasks: Tasks[];
    createdAt: Date;
}
