import { TaskListRepositoryPort } from '../../../../application/ports/output/TaskListRepositoryPort';
import { TaskList } from '../../../../domain/taskList/TaskList';
import { ListId } from '../../../../domain/shared/types';
import { ListName } from '../../../../domain/taskList/ListName.vo';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryTaskListRepository implements TaskListRepositoryPort {
  private taskLists: Map<ListId, TaskList> = new Map();

  async findById(listId: ListId): Promise<TaskList | null> {
    const taskList = this.taskLists.get(listId);
    return taskList ? this.cloneTaskList(taskList) : null;
  }

  async findAll(): Promise<TaskList[]> {
    return Array.from(this.taskLists.values()).map(taskList => this.cloneTaskList(taskList));
  }

  async save(taskList: TaskList): Promise<void> {
    this.taskLists.set(taskList.id, this.cloneTaskList(taskList));
  }

  async delete(listId: ListId): Promise<void> {
    this.taskLists.delete(listId);
  }

  async findByName(name: ListName): Promise<TaskList | null> {
    for (const taskList of this.taskLists.values()) {
      if (taskList.name.equals(name)) {
        return this.cloneTaskList(taskList);
      }
    }
    return null;
  }

  async nextId(): Promise<ListId> {
    return uuidv4();
  }

  // テスト用のヘルパーメソッド
  clear(): void {
    this.taskLists.clear();
  }

  size(): number {
    return this.taskLists.size;
  }

  private cloneTaskList(taskList: TaskList): TaskList {
    // 簡易的なクローン実装
    // 実際のプロジェクトでは、より堅牢なクローン機能が必要
    const cloned = new TaskList(taskList.id, taskList.name);
    // タスクのクローンは今回は省略（TaskListのみの実装のため）
    return cloned;
  }
}