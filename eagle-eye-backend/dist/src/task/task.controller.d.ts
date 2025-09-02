import { TaskService } from './task.service';
import { CreateTaskDto } from './taskDto/create-task.dto';
import { UpdateTaskDto } from './taskDto/update-task.dto';
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    getTask(req: any): Promise<import("../entities/tasks.entity").Tasks[]>;
    getEmployeesToAssingeTask(req: any): Promise<any>;
    getTaskById(id: string, req: any): Promise<import("../entities/tasks.entity").Tasks>;
    getTodaysTask(req: any): Promise<import("../entities/tasks.entity").Tasks[]>;
    getTaskByProjectId(id: string, req: any): Promise<import("../entities/tasks.entity").Tasks[]>;
    createTask(createTaskDto: CreateTaskDto, req: any): Promise<import("../entities/tasks.entity").Tasks>;
    updateTask(id: string, updateTaskDto: UpdateTaskDto, req: any): Promise<import("../entities/tasks.entity").Tasks>;
    assignTask(id: string, body: {
        userId: number;
    }, req: any): Promise<import("../entities/tasks.entity").Tasks>;
    deleteTask(id: string, req: any): Promise<import("../entities/tasks.entity").Tasks>;
}
