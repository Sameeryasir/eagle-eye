import { UserService } from './user.service';
import { CreateUserDto } from './userDto/create-user.dto';
import { UpdateUserDto } from './userDto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUsers(req: any): Promise<import("../entities/users.entity").Users[]>;
    getUserById(id: string, req: any): Promise<import("../entities/users.entity").Users>;
    createUser(createUserDto: CreateUserDto, req: any): Promise<import("../entities/users.entity").Users | null>;
    deleteById(id: string, req: any): Promise<import("../entities/users.entity").Users>;
    updateUserById(id: string, updateUserDto: UpdateUserDto, req: any): Promise<import("../entities/users.entity").Users>;
    sendNotification(body: {
        token: string;
        title: string;
        message: string;
    }): Promise<any>;
}
