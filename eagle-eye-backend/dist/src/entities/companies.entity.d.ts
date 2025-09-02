import { Users } from './users.entity';
import { Projects } from './projects.entity';
export declare class Companies {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    owner: Users;
    projects: Projects[];
}
