import { LogService } from './log.service';
import { CreateLogDto } from './logDto/create-log.dto';
import { UpdateLogDto } from './logDto/update-log.dto';
export declare class LogController {
    private readonly logService;
    constructor(logService: LogService);
    getLogs(req: any): Promise<import("../entities/logs.entity").Logs[]>;
    createLog(createLogDto: CreateLogDto, req: any): Promise<{
        message: string;
        log: import("../entities/logs.entity").Logs;
    }>;
    getLogById(id: string, req: any): Promise<import("../entities/logs.entity").Logs>;
    updateLog(id: string, updateLogDto: UpdateLogDto, req: any): Promise<import("../entities/logs.entity").Logs>;
    deleteLog(id: string, req: any): Promise<import("../entities/logs.entity").Logs>;
}
