import { TaskService } from './task.service';
export declare class ManagerTaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    getManagerAssignedTasksByProject(projectId: string, req: any): Promise<any>;
}
