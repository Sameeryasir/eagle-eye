import { TaskPriority } from 'src/entities/tasks.entity';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    startTime?: string;
    minStartTime?: string;
    endTime?: string;
    priority?: TaskPriority;
    projectId?: number;
    assignedToUserId?: number;
}
