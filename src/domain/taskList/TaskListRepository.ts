import { TaskList } from './TaskList';
import { ListId } from '../shared/types';
import { ListName } from './ListName.vo';

export interface TaskListRepository {
  findById(listId: ListId): Promise<TaskList | null>;
  findAll(): Promise<TaskList[]>;
  save(taskList: TaskList): Promise<void>;
  delete(listId: ListId): Promise<void>; // この操作を実行すると、削除されるタスクリストに所属するすべてのタスクも同時に削除されます。
  findByName(name: ListName): Promise<TaskList | null>;
}