export declare class TaskFilterDto {
    projectId: number;
    sortBy?: 'createdAt' | 'startTime' | 'endTime';
    assignedTo?: 'me';
    email?: string;
    unassigned?: boolean;
    closedTask?: boolean;
}
