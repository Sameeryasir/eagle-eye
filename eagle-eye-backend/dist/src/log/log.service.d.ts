import { Logs } from 'src/entities/logs.entity';
import { Tasks } from 'src/entities/tasks.entity';
import { Users } from 'src/entities/users.entity';
import { Roles } from 'src/entities/roles.entity';
import { Repository } from 'typeorm';
import { CreateLogDto } from './logDto/create-log.dto';
import { UpdateLogDto } from './logDto/update-log.dto';
interface AuthenticatedUser {
    id: number;
    email: string;
    role: Roles;
}
export declare class LogService {
    private logrepo;
    private taskrepo;
    private userrepo;
    constructor(logrepo: Repository<Logs>, taskrepo: Repository<Tasks>, userrepo: Repository<Users>);
    private checkAuth;
    private checkAdmin;
    createLog(createLogDto: CreateLogDto, authUser: AuthenticatedUser): Promise<{
        message: string;
        log: Logs;
    }>;
    getLogs(authUser: AuthenticatedUser): Promise<Logs[]>;
    updateLog(logId: number, updateLogDto: UpdateLogDto, authUser: AuthenticatedUser): Promise<Logs>;
    deleteLog(logId: number, authUser: AuthenticatedUser): Promise<Logs>;
    getLogById(logId: number, authUser: AuthenticatedUser): Promise<Logs>;
}
export {};
