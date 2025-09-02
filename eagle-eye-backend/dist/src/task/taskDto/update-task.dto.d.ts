import { TaskPriority } from 'src/entities/tasks.entity';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    priority?: TaskPriority;
    projectId?: number;
    assignedToUserId?: number;
}
