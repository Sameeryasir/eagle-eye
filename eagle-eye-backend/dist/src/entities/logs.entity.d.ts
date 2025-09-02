import { Users } from './users.entity';
import { Tasks } from './tasks.entity';
import { Images } from './images.entity';
export declare class Logs {
    id: number;
    note: string | null;
    createdAt: Date;
    user: Users;
    tasks: Tasks[];
    images: Images[];
}
