import { Repository } from 'typeorm';
import { Users } from 'src/entities/users.entity';
import { Roles } from 'src/entities/roles.entity';
import { CreateUserDto } from './userDto/create-user.dto';
import { UpdateUserDto } from './userDto/update-user.dto';
import { Companies } from 'src/entities/companies.entity';
interface AuthenticatedUser {
    id: number;
    email: string;
    role: Roles;
}
export declare class UserService {
    private userRepo;
    private roleRepo;
    private companyRepo;
    constructor(userRepo: Repository<Users>, roleRepo: Repository<Roles>, companyRepo: Repository<Companies>);
    private checkAuth;
    private checkAdmin;
    getAllUsers(authUser: AuthenticatedUser): Promise<Users[]>;
    findUserById(id: number, authUser: AuthenticatedUser): Promise<Users>;
    createUserWithRole(dto: CreateUserDto, authUser: AuthenticatedUser): Promise<Users | null>;
    deleteUserById(id: number, authUser: AuthenticatedUser): Promise<Users>;
    updateUser(id: number, dto: UpdateUserDto, authUser: AuthenticatedUser): Promise<Users>;
    sendPushNotification(token: string, title: string, message: string): Promise<any>;
}
export {};
