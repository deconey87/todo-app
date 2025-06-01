import { TaskList } from '../../../domain/taskList/TaskList';
import { ListId } from '../../../domain/shared/types';
import { ListName } from '../../../domain/taskList/ListName.vo';

export interface TaskListRepositoryPort {
  findById(listId: ListId): Promise<TaskList | null>;
  findAll(): Promise<TaskList[]>;
  save(taskList: TaskList): Promise<void>;
  delete(listId: ListId): Promise<void>;
  findByName(name: ListName): Promise<TaskList | null>;
}