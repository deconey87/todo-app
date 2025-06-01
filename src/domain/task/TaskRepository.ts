import { Task } from './Task';
import { TaskId, ListId } from '../shared/types';

export interface TaskRepository {
  findById(taskId: TaskId): Promise<Task | null>;
  findByListId(listId: ListId): Promise<Task[]>;
  save(task: Task): Promise<void>;
  delete(taskId: TaskId): Promise<void>;
  findAll(): Promise<Task[]>; // オプションだが、インターフェースに含める
}