import { Users } from './users.entity';
export declare class Otps {
    id: number;
    code: string;
    isUsed: boolean;
    createdAt: Date;
    user: Users;
}
