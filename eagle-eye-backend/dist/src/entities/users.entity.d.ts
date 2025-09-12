import { Otps } from './otps.entity';
import { Roles } from './roles.entity';
import { Companies } from './companies.entity';
import { Projects } from './projects.entity';
import { Tasks } from './tasks.entity';
import { Logs } from './logs.entity';
import { expoTokens } from './expoTokens.entity';
import { Events } from './events.entity';
export declare class Users {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    title: string;
    dob: Date;
    phone: string;
    otp: Otps;
    role: Roles;
    createdBy: Users;
    company: Companies;
    ownedProjects: Projects[];
    tasks: Tasks[];
    logs: Logs[];
    expoPushTokens: expoTokens[];
    events: Events[];
}
