import { CreateTaskListDto } from '../../dto/CreateTaskListDto';
import { TaskListDto } from '../../dto/TaskListDto';

export interface TaskListManagementPort {
  createTaskList(dto: CreateTaskListDto): Promise<TaskListDto>;
  getTaskList(id: string): Promise<TaskListDto | null>;
  getAllTaskLists(): Promise<TaskListDto[]>;
  deleteTaskList(id: string): Promise<void>;
}