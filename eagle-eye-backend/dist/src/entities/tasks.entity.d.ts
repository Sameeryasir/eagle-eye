import { Users } from './users.entity';
import { Projects } from './projects.entity';
import { Logs } from './logs.entity';
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class Tasks {
    id: number;
    title: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    priority: TaskPriority;
    createdAt: Date;
    project: Projects;
    assignedTo?: Users;
    log: Logs | null;
}
